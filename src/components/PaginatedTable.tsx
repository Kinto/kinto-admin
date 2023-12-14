import React from "react";

import Spinner from "./Spinner";

type Props = {
  thead: React.ReactNode;
  tbody: React.ReactNode;
  dataLoaded: boolean;
  colSpan: number;
  hasNextPage: boolean;
  listNextPage?: () => any;
};

export default function PaginatedTable({
  thead,
  tbody,
  dataLoaded,
  colSpan,
  hasNextPage,
  listNextPage,
}: Props) {
  return (
    <table
      className="table table-striped table-bordered record-list"
      data-testid="paginatedTable"
    >
      {thead}
      {tbody}
      {hasNextPage && (
        <tfoot>
          <tr>
            <td colSpan={colSpan} className="load-more text-center">
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
  );
}
