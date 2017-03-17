/* @flow */

import React, { PureComponent } from "react";

import Spinner from "./Spinner";

export default class PaginatedTable extends PureComponent {
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
        {hasNextPage &&
          <tfoot>
            <tr>
              <td colSpan={colSpan} className="load-more text-center">
                {!dataLoaded
                  ? <Spinner />
                  : <a
                      href="."
                      key="__3"
                      onClick={event => {
                        event.preventDefault();
                        listNextPage();
                      }}>
                      Load more
                    </a>}
              </td>
            </tr>
          </tfoot>}
      </table>
    );
  }
}
