import { useUrlSearchParams } from "@/hooks/useUrlParams";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import ReactPaginate from "react-paginate";
export default function Paginate({
  totalPageCount,
}: {
  totalPageCount: number;
}) {
  const [searchParams, setSearchParams] = useUrlSearchParams();

  const currentPage = Number(searchParams.get("page"))
    ? Number(searchParams.get("page"))
    : 1;

  const handlePageChange = (e: { selected: number }) => {
    setSearchParams("page", String(e.selected + 1));
  };

  if (totalPageCount <= 1) return null;

  return (
    <div className="flex p-12">
      <ReactPaginate
        containerClassName="flex items-center space-x-1 mx-auto"
        pageLinkClassName="w-[30px] h-[30px] block flex items-center justify-center rounded-full text-sm hover:bg-neutral-200"
        activeLinkClassName="bg-black hover:bg-black text-white"
        breakLinkClassName="pb-[7px] w-[30px] h-[30px] block flex items-center justify-center rounded-full text-sm hover:bg-neutral-200"
        previousLinkClassName="w-[30px] h-[30px] block flex items-center justify-center rounded-full text-sm hover:bg-neutral-200"
        nextLinkClassName="w-[30px] h-[30px] block flex items-center justify-center rounded-full text-sm hover:bg-neutral-200"
        disabledLinkClassName="opacity-20"
        breakLabel="..."
        nextLabel={<ArrowRightIcon />}
        marginPagesDisplayed={2}
        forcePage={currentPage - 1}
        onPageChange={handlePageChange}
        pageRangeDisplayed={3}
        pageCount={totalPageCount}
        previousLabel={<ArrowLeftIcon />}
        renderOnZeroPageCount={null}
      />
    </div>
  );
}
