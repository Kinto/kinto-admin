/* @flow */

import { PureComponent } from "react";
import * as React from "react";

import Spinner from "./Spinner";

type Props = {
  thead: React.Element<React.ElementType>,
  tbody: React.Element<React.ElementType>,
  dataLoaded: boolean,
  colSpan: number,
  hasNextPage: boolean,
  listNextPage: ?() => void,
};

export default class PaginatedTable extends PureComponent<Props> {
  render() {
    const {
      thead,
      tbody,
      dataLoaded,
      colSpan,
      hasNextPage,
      listNextPage,
    } = this.props;
    return (
      <table className="table table-striped table-bordered record-list">
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
                    }}>
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
}
