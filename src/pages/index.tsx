import { Card } from "@/components/Card";
import { handleCSV } from "@/utils/nic-csv";
import { handleROA, NISFinal_type } from "@/utils/roa-csv";
import Head from "next/head";
import { useEffect, useState } from "react";

export type NIC_type = {
  name: string;
  company: string;
  ticker: string;
  tenure_cash: number;
  tenure_start_cash: number | undefined;
  tenure_end_cash: number | undefined;
  tenure_start_noncash: number | undefined;
  tenure_end_noncash: number | undefined;
  tenure_non_cash: number;
  total_cash_ratio: number;
  total_non_cash_ratio: number;
};

export default function Home() {
  const [data, setData] = useState<NISFinal_type[] | null>(null);
  const [stats, setStats] = useState<{
    min_cash: number;
    max_cash: number;
    min_non_cash: number;
    max_non_cash: number;
  }>({
    min_cash: Infinity,
    max_cash: 0,
    min_non_cash: Infinity,
    max_non_cash: 0,
  });

  useEffect(() => {
    async function executeCSV() {
      const result = await handleCSV();
      if (result) {
        const final_result = await handleROA(result);
        setData(final_result);
      }
    }
    executeCSV();
  }, []);

  data?.forEach((el) => {
    if (el.total_cash_ratio > stats.max_cash) {
      setStats((state) => ({ ...state, max_cash: el.total_cash_ratio }));
    } else if (el.total_cash_ratio < stats.min_cash) {
      setStats((state) => ({ ...state, min_cash: el.total_cash_ratio }));
    }

    if (el.total_non_cash_ratio > stats.max_non_cash) {
      setStats((state) => ({
        ...state,
        max_non_cash: el.total_non_cash_ratio,
      }));
    } else if (el.total_non_cash_ratio < stats.min_non_cash) {
      setStats((state) => ({
        ...state,
        min_non_cash: el.total_non_cash_ratio,
      }));
    }
  });

  return (
    <>
      <Head>
        <title>Narcissism Index Score Step (1) and (2)</title>
        <meta
          name="description"
          content="Narcissism Index Score CSV Data Reader"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-20">
        <h1 className="text-3xl text-yellow-500 mb-4">
          <strong>Narcissim Index Score</strong>
        </h1>
        <p className="mb-2">
          <strong>Narcissism Index Score Reader</strong>
        </p>
        <ul className="text-sm mb-4">
          <li className="italic mb-1">
            (1) Relative cash pay of the CEO to the next-highest paid executive
          </li>
          <li className="italic">
            (2) Relative non-cash pay of the CEO to the next-highest paid
            executive{" "}
          </li>
        </ul>
        <p className="text-sm max-w-lg mb-4">
          This application calculates and displays the compensation ratio of the
          items explained above (1) and (2) of the given founder CEO's in the
          CSV file.
        </p>
        <p className="text-xs max-w-lg mb-20 text-yellow-500">
          <i>
            The data was just available until 2022 and some years were not put
            into consideration because they did not pass all the validations.
          </i>
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <p>
            <strong>CEO Sum: {data?.length}</strong>
          </p>
          <div className="flex w-full text-sm text-cyan-300 items-center gap-4">
            <p>Min Cash Ratio: {stats.min_cash}</p>
            <p>Max Cash Ratio: {stats.max_cash}</p>
          </div>
          <div className="flex w-full text-sm text-rose-400 items-center gap-4">
            <p>Min Non-Cash Ratio: {stats.min_non_cash}</p>
            <p>Max Non-Cash Ratio: {stats.max_non_cash}</p>
          </div>
        </div>
        {data?.map((el, i) => (
          <Card key={i} {...el} />
        ))}
      </main>
    </>
  );
}
