import Spinner from "./Spinner";
import type { ReactNode } from "react";

interface Props {
  thead: ReactNode;
  tbody: ReactNode;
  dataLoaded: boolean;
  colSpan: number;
  hasNextPage: boolean;
  listNextPage?: () => any;
}

export default function PaginatedTable({
  thead,
  tbody,
  dataLoaded,
  colSpan,
  hasNextPage,
  listNextPage,
}: Props) {
  return (
    <div
      className={dataLoaded ? "data-table" : "data-table data-table-loading"}
    >
      <table
        className="table table-striped table-bordered"
        data-testid="paginatedTable"
      >
        {thead}
        {tbody}
        {hasNextPage && (
          <tfoot>
            <tr>
              <td
                colSpan={colSpan}
                className="data-table-load-more text-center"
              >
                {!dataLoaded ? (
                  <Spinner />
                ) : (
                  <a
                    href="."
                    key="__3"
                    onClick={event => {
                      event.preventDefault();
                      // FIXME: we should always have listNextPage if
                      // we have hasNextPage
                      if (listNextPage) {
                        listNextPage();
                      }
                    }}
                  >
                    Load more
                  </a>
                )}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
