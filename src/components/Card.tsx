import { NISFinal_type } from "@/utils/roa-csv";

interface CardProps extends NISFinal_type {}

export const Card = ({
  name,
  company,
  ticker,
  tenure_cash,
  tenure_start_cash,
  tenure_end_cash,
  tenure_start_noncash,
  tenure_end_noncash,
  tenure_non_cash,
  total_cash_ratio,
  total_non_cash_ratio,
  sic,
  roa_all,
  roa_avg,
  roe_all,
  roe_avg,
  ggroup,
  gsector,
  gind,
}: CardProps) => {
  return (
    <div className="flex flex-col max-w-xl rounded-lg border-2 border-white border-opacity-25 hover:border-opacity-50 transition-all duration-300 ease-in-out p-6 mb-4">
      <p className="mb-1">
        <strong>{name}</strong>
      </p>
      <div className="w-full flex justify-between items-center mb-3">
        <p className="text-sm">
          {company} | {ticker}
        </p>
        <p className="text-sm">
          <strong>Group: </strong>
          {ggroup} | <strong>Sector: </strong>
          {gsector} | <strong>Industry: </strong> {gind}
        </p>
      </div>

      <p className="text-sm mb-3">
        {tenure_start_cash && tenure_end_cash && (
          <span className="text-sm text-yellow-300 mr-2">
            {tenure_start_cash} - {tenure_end_cash}
          </span>
        )}
        Identified {tenure_cash} {tenure_cash === 1 ? "year" : "years"} of
        complete data for cash pay <br />
        {tenure_start_noncash && tenure_end_noncash && (
          <span className="text-sm text-yellow-300 mr-2">
            {tenure_start_noncash} - {tenure_end_noncash}
          </span>
        )}
        Identified {tenure_non_cash} {tenure_non_cash === 1 ? "year" : "years"}{" "}
        of complete data for non-cash pay
      </p>
      <p className="text-sm mb-1">
        <strong>Total cash pay ratio: {total_cash_ratio.toFixed(3)}</strong>
      </p>
      <p className="text-sm mb-3">
        <strong>
          Total non-cash pay ratio: {total_non_cash_ratio.toFixed(3)}
        </strong>
      </p>
      {roa_avg && (
        <p className="text-sm mb-3">
          <strong>
            Average RoA: {roa_avg.toFixed(4)}{" "}
            <span className="text-yellow-300">
              ({(roa_avg * 100).toFixed(2)}%)
            </span>
          </strong>
        </p>
      )}
      {roe_avg && (
        <p className="text-sm mb-3">
          <strong>
            Average RoE: {roe_avg.toFixed(4)}{" "}
            <span className="text-yellow-300">
              ({(roe_avg * 100).toFixed(2)}%)
            </span>
          </strong>
        </p>
      )}
    </div>
  );
};
