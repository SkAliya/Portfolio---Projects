"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function Filter({ filter }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeFilter = searchParams.get("capacity") ?? "all";

  function handleFun(filter) {
    const params = new URLSearchParams(searchParams);

    params.set("capacity", filter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }
  return (
    <div className="border border-primary-800 flex">
      <Button handleFun={handleFun} filter="all" activeFilter={activeFilter}>
        All cabins
      </Button>
      <Button handleFun={handleFun} filter="small" activeFilter={activeFilter}>
        1 &mdash; 3
      </Button>
      <Button handleFun={handleFun} filter="medium" activeFilter={activeFilter}>
        4 &mdash; 7
      </Button>
      <Button handleFun={handleFun} filter="large" activeFilter={activeFilter}>
        8 &mdash; 12
      </Button>
    </div>
  );
}

export default Filter;

function Button({ filter, handleFun, activeFilter, children }) {
  return (
    <button
      className={`px-5 py-2 ${
        filter === activeFilter ? "bg-primary-700 text-primary-50" : ""
      }`}
      onClick={() => handleFun(filter)}
    >
      {children}
    </button>
  );
}
