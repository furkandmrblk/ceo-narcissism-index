import { ceoFullNames } from "@/lib/ceos";
import { NIC_type } from "@/pages";

type CEOAttributes_type = {
  CONAME: string;
  TICKER: string;
  CO_PER_ROL: number;
  GVKEY: number;

  EXEC_FULLNAME: string;
  AGE: number;
  GENDER: string;

  PCEO: string;
  BECAMECEO: string;
  TITLE: string;
  TITLEANN: string;

  SALARY: number;
  BONUS: number;

  OPTION_AWARDS: number;
  STOCK_AWARDS: number;

  SIC: number;
  SICDESC: string;

  YEAR: number;
};

const handleCEORatio = (
  ceo: { name: string; cash: number; non_cash: number; isCEO: boolean } | null,
  executive_cash: { name: string; pay: number } | null,
  executive_noncash: { name: string; pay: number } | null,
  year: number | null
) => {
  let cash_ratio: number | null = null;
  let non_cash_ratio: number | null = null;

  if (ceo && ceo.isCEO && executive_cash && year) {
    cash_ratio = isNaN(ceo.cash / executive_cash.pay)
      ? 0
      : ceo.cash / (executive_cash.pay === 0 ? 1 : executive_cash.pay);
  }

  if (
    ceo &&
    ceo.isCEO &&
    executive_noncash &&
    executive_noncash.pay >= 0 &&
    ceo.non_cash >= 0
  ) {
    non_cash_ratio = isNaN(ceo.non_cash / executive_noncash.pay)
      ? 0
      : ceo.non_cash /
        (executive_noncash.pay === 0 ? 1 : executive_noncash.pay);
  }

  if (year) {
    return { cash_ratio, non_cash_ratio, year };
  } else return null;
};

export const handleCSV = async () => {
  // @ts-ignore
  const file: CEOAttributes_type[] = await import("../../public/NIC2.csv");
  if (typeof window !== "undefined") {
    const keys = Object.keys(file);

    const CEOS: {
      name: string;
      company: string;
      ticker: string;
      tenure_cash: { year: number; cash_ratio: number }[];
      tenure_non_cash: { year: number; non_cash_ratio: number }[];
    }[] = [];

    const totalRatios: NIC_type[] = [];

    let currentCompany: { name: string; ticker: string } | null = null;

    let currentYear: number | null = null;

    let currentCEO: {
      name: string;
      cash: number;
      non_cash: number;
      isCEO: boolean;
    } | null = null;

    let currentCEOYearsCash: {
      year: number;
      cash_ratio: number;
    }[] = [];

    let currentCEOYearsNonCash: { year: number; non_cash_ratio: number }[] = [];

    let currentMostPaidCashExecutive: { name: string; pay: number } | null =
      null;

    let currentMostPaidNonCashExecutive: { name: string; pay: number } | null =
      null;

    keys.map((el: string) => {
      const row = file[el as any];

      if (Number(el) === keys.length - 1) {
        if (currentCEO && currentCompany) {
          CEOS.push({
            name: currentCEO.name,
            company: currentCompany.name,
            ticker: currentCompany.ticker,
            tenure_cash: [...currentCEOYearsCash],
            tenure_non_cash: [...currentCEOYearsNonCash],
          });
        }
      }

      // ? Check and set current company and year
      if (currentYear === null || currentYear !== Number(row.YEAR)) {
        const result = handleCEORatio(
          currentCEO,
          currentMostPaidCashExecutive,
          currentMostPaidNonCashExecutive,
          currentYear
        );

        if (result) {
          if (result?.cash_ratio !== null) {
            currentCEOYearsCash.push({
              cash_ratio: result.cash_ratio,
              year: result.year,
            });
          }

          if (result?.non_cash_ratio !== null) {
            currentCEOYearsNonCash.push({
              non_cash_ratio: result.non_cash_ratio,
              year: result.year,
            });
          }
        }

        currentYear = Number(row.YEAR);

        currentMostPaidCashExecutive = null;
        currentMostPaidNonCashExecutive = null;
      }

      if (currentCompany === null || currentCompany.name !== row.CONAME) {
        if (currentCEO && currentCompany) {
          CEOS.push({
            name: currentCEO.name,
            company: currentCompany.name,
            ticker: currentCompany.ticker,
            tenure_cash: currentCEOYearsCash,
            tenure_non_cash: currentCEOYearsNonCash,
          });
        }

        currentCompany = { name: row.CONAME, ticker: row.TICKER };
        currentYear = Number(row.YEAR);

        currentCEO = null;
        currentMostPaidCashExecutive = null;
        currentMostPaidNonCashExecutive = null;
        currentCEOYearsCash = [];
        currentCEOYearsNonCash = [];
      }

      if (ceoFullNames.includes(row.EXEC_FULLNAME)) {
        // ? Check if founder was current CEO that year
        const ceoIndications = ["CEO", "ceo", "Chief Executive Officer"];
        let isCurrentCEO: boolean = false;

        ceoIndications.map((indication) => {
          if (
            (row.PCEO && row.PCEO.includes(indication)) ||
            (row.TITLE && row.TITLE.includes(indication)) ||
            (row.TITLEANN && row.TITLEANN.includes(indication))
          ) {
            isCurrentCEO = true;
          }
        });

        if (isCurrentCEO) {
          // ? Check if data is complete
          currentCEO = {
            name: row.EXEC_FULLNAME,
            cash: Number(row.SALARY ?? 0) + Number(row.BONUS ?? 0),
            non_cash:
              Number(row.STOCK_AWARDS ?? 0) + Number(row.OPTION_AWARDS ?? 0),
            isCEO: true,
          };
        } else {
          if (currentCEO) {
            currentCEO = {
              name: currentCEO.name,
              cash: Number(row.SALARY) + Number(row.BONUS),
              non_cash: Number(row.STOCK_AWARDS) + Number(row.OPTION_AWARDS),
              isCEO: false,
            };
          }
        }
        isCurrentCEO = false;
      } else {
        // ? Is an executive

        // ? Check cash
        if (
          currentMostPaidCashExecutive === null ||
          Number(row.SALARY) + Number(row.BONUS) >
            currentMostPaidCashExecutive?.pay
        ) {
          currentMostPaidCashExecutive = {
            name: row.EXEC_FULLNAME,
            pay: Number(row.SALARY) + Number(row.BONUS),
          };
        }

        // ? Check non-cash
        if (
          currentMostPaidNonCashExecutive === null ||
          Number(row.OPTION_AWARDS) + Number(row.STOCK_AWARDS) >
            currentMostPaidNonCashExecutive?.pay
        ) {
          currentMostPaidNonCashExecutive = {
            name: row.EXEC_FULLNAME,
            pay: Number(row.OPTION_AWARDS) + Number(row.STOCK_AWARDS),
          };
        }
      }
    });

    // ? Calculate total cash & non-cash ratio
    CEOS.map((ceo) => {
      let cashSum: number = 0;
      let nonCashSum: number = 0;

      ceo.tenure_cash.map((el) => {
        cashSum += el.cash_ratio;
      });

      ceo.tenure_non_cash.map((el) => {
        nonCashSum += el.non_cash_ratio;
      });

      totalRatios.push({
        name: ceo.name,
        company: ceo.company,
        ticker: ceo.ticker,
        tenure_cash: ceo.tenure_cash.length,
        tenure_non_cash: ceo.tenure_non_cash.length,
        total_cash_ratio: cashSum / ceo.tenure_cash.length,
        total_non_cash_ratio: nonCashSum / ceo.tenure_non_cash.length,
        tenure_start_cash: ceo.tenure_cash[0].year,
        tenure_end_cash: ceo.tenure_cash[ceo.tenure_cash.length - 1].year,
        tenure_start_noncash:
          ceo.tenure_non_cash.length > 0
            ? ceo.tenure_non_cash[0].year
            : undefined,
        tenure_end_noncash:
          ceo.tenure_non_cash.length > 0
            ? ceo.tenure_non_cash[ceo.tenure_non_cash.length - 1].year
            : undefined,
      });
    });

    return totalRatios;
  }
};
