import { getData } from "@/lib/actions";
import { Info, ResultCode } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import EmptyState from "./empty";
import ErrorMessages from "./error";
import List from "./list";
import Search from "./search";

const emptyState = {
  data: [],
  code: ResultCode.Empty,
};

export const SearchTab = ({
  info,
  active,
}: {
  info?: Info;
  active: boolean;
}) => {
  const [search, setSearch] = useState<string>("");
  const [searchParam, setSearchParam] = useQuerySearchParam();
  const [isInitial, setIsInitial] = useState(true);

  const {
    data,
    mutate: fetchResults,
    isPending: isLoading,
  } = useMutation({
    mutationFn: async (query: string) => await getData(query),
  });
  const state = data ?? emptyState;

  useEffect(() => {
    if (!isInitial) return;
    setIsInitial(false);
    if (searchParam) fetchResults(searchParam);
    setSearch(searchParam);
  }, [searchParam, isInitial]);

  const onSubmit = () => {
    setSearchParam(search);
    fetchResults(search);
  };

  return (
    <div className={!active ? "hidden" : ""}>
      <Search
        value={search}
        onChange={setSearch}
        onSubmit={onSubmit}
        loading={isLoading}
        info={info}
      />

      <div className="mt-8">
        <ErrorMessages state={state} />
      </div>

      <div className="mt-8">
        <EmptyState
          loading={isLoading}
          state={state}
          onSearch={(query: string) => {
            setSearch(query);
            setSearchParam(query);
            fetchResults(query);
          }}
        />
      </div>

      <div className="mt-8">
        <List loading={isLoading} state={state} info={info} />
      </div>
    </div>
  );
};

const useQuerySearchParam = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = searchParams.get("query") ?? "";

  const setState = useCallback(
    (state: string) => {
      if (!state) router.push(pathname);
      else
        router.push(
          `${pathname}?${new URLSearchParams({
            query: state,
          })}`
        );
    },
    [searchParams]
  );

  return [state, setState] as const;
};
