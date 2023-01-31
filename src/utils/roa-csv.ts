import { NIC_type } from "@/pages";

type CompanyAttributes_type = {
  at: number;
  act: number;
  conm: string;
  tic: string;
  ib: number;
  ceq: number;
  sic: number;
  fyear: number;
  ggroup: number;
  gsector: number;
  gind: number;
};

export type NISFinal_type = {
  roa_all: { year: number; roa: number }[];
  roa_avg?: number;
  roe_all: { year: number; roe: number }[];
  roe_avg?: number;
  sic: number;
  ggroup: number;
  gsector: number;
  gind: number;
} & NIC_type;

export const handleROA = async (data: NIC_type[]) => {
  // @ts-ignore
  const file = await import("../../public/ROA_ROE.csv");
  const keys = Object.keys(file);

  const nicMap: Map<string, NIC_type> = new Map(
    data.map((el) => [el.ticker, el])
  );

  const nicArr: NISFinal_type[] = [];

  let currentCompany: {
    name: string;
    ticker: string;
    sic: number;
    ggroup: number;
    gsector: number;
    gind: number;
  } | null = null;
  let companyROA: { year: number; roa: number }[] = [];
  let companyROE: { year: number; roe: number }[] = [];

  keys.map((el: string) => {
    const row: CompanyAttributes_type = file[el as any];

    if (nicMap.has(row.tic)) {
      const nicItem = nicMap.get(row.tic);

      if (currentCompany === null || row.tic !== currentCompany.ticker) {
        // ? Calculate Avg ROA & ROE - store everything
        let sumRoa: number = 0;
        let sumRoe: number = 0;

        if (currentCompany && nicItem) {
          companyROA.map((item) => {
            sumRoa += item.roa;
          });

          companyROE.map((item) => {
            sumRoe += item.roe;
          });

          nicArr.push({
            ...nicItem,
            roa_all: companyROA,
            roa_avg: sumRoa / companyROA.length,
            roe_all: companyROE,
            roe_avg: sumRoe / companyROE.length,
            sic: currentCompany.sic,
            ggroup: currentCompany.ggroup,
            gsector: currentCompany.gsector,
            gind: currentCompany.gind,
          });
        }

        currentCompany = {
          name: row.conm,
          ticker: row.tic,
          sic: row.sic,
          ggroup: row.ggroup,
          gsector: row.gsector,
          gind: row.gind,
        };
        companyROA = [];
        companyROE = [];
        sumRoa = 0;
        sumRoe = 0;
      }

      // ? Check if data is complete
      if (row.at && row.ib && nicItem) {
        // ? Check if years overlap with CEO tenure
        if (nicItem.tenure_start_cash && nicItem.tenure_end_cash) {
          if (
            row.fyear >= nicItem.tenure_start_cash &&
            row.fyear <= nicItem.tenure_end_cash
          ) {
            let hasYearRoa = companyROA.some((el) => el.year === row.fyear);
            let hasYearRoe = companyROE.some((el) => el.year === row.fyear);

            if (!hasYearRoa) {
              companyROA.push({ year: row.fyear, roa: row.ib / row.at });
            }

            if (!hasYearRoe) {
              companyROE.push({ year: row.fyear, roe: row.ib / row.ceq });
            }
          }
        }
      }
    }
  });

  return nicArr;
};
