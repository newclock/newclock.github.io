import { getCell, getColumnByCell, getRowIdentity } from './util'
import { getStyle, hasClass, addClass, removeClass } from 'element-ui/src/utils/dom'
// import ElCheckbox from 'element-ui/packages/checkbox';
// import ElTooltip from 'element-ui/packages/tooltip';
import debounce from 'throttle-debounce/debounce'
import LayoutObserver from './layout-observer'

export default {
  name: 'ElTableBody',

  mixins: [LayoutObserver],

  components: {
    // ElCheckbox,
    // ElTooltip
  },

  props: {
    store: {
      required: true
    },
    stripe: Boolean,
    context: {},
    rowClassName: [String, Function],
    rowStyle: [Object, Function],
    fixed: String,
    highlight: Boolean,
    dragRow: [String, Boolean],
    recordShow: Array,
    recordScrollTop: Number,
    bigDataShow: Array
  },

  render (h) {
    const columnsHidden = this.columns.map((column, index) => this.isColumnHidden(index))
    let dataL = this.data.length
    return (
      this.recordShow.length > 1
        ? <table
            class="el-table__body"
            cellspacing="0"
            cellpadding="0"
            border="0">
            <colgroup>
            {
                this._l(this.columns, column => <col name={ column.id } />)
            }
            </colgroup>
            <tbody class="icore-big-data-body-first">
            {this._l(this.data.slice((this.bigDataShow[0] * 8 * this.firstShow), (this.bigDataShow[0] * 8 * this.firstShow + this.bigDataShow[0])), (row, $index) => {
              let $indexData = this.bigDataShow[0] * 8 * this.firstShow + $index
              return (
              [<tr
                                draggable = {!!this.dragRow}
                                on-drop={ ($event) => this.dropRowSet($event, $index)}
                                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                                on-dragover={ ($event) => this.dropRowOver($event) }
                                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                                on-click={ ($event) => this.handleClick($event, row) }
                                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                                on-mouseenter={ _ => this.handleMouseEnter($index) }
                                on-mouseleave={ _ => this.handleMouseLeave() }
                                class={ [this.getRowClass(row, $index)] }>
                                {
                                this._l(this.columns, (column, cellIndex) => {
                                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)
                                  if (!rowspan || !colspan) {
                                    return ''
                                  } else {
                                    if (rowspan === 1 && colspan === 1) {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    } else {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            rowspan={ rowspan }
                                            colspan={ colspan }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    }
                                  }
                                })
                                }
                            </tr>,
                this.store.isRowExpanded(row)
                                ? (<tr>
                                <td colspan={ this.columns.length } class="el-table__expanded-cell">
                                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                                </td>
                                </tr>)
                                : ''
              ]
              )
            }
                ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
                )
            }
            </tbody>
            <tbody class="icore-big-data-body-second">
            {this._l(this.data.slice((this.bigDataShow[0] + this.secondShow * this.bigDataShow[0] * 8), (this.bigDataShow[0] * 2 + this.secondShow * this.bigDataShow[0] * 8)), (row, $index) => {
              let $indexData = this.bigDataShow[0] + this.secondShow * this.bigDataShow[0] * 8 + $index
              $index = this.bigDataShow[0] + $index
              return (
              [<tr
                                draggable = {!!this.dragRow}
                                on-drop={ ($event) => this.dropRowSet($event, $index)}
                                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                                on-dragover={ ($event) => this.dropRowOver($event) }
                                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                                on-click={ ($event) => this.handleClick($event, row) }
                                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                                on-mouseenter={ _ => this.handleMouseEnter($index) }
                                on-mouseleave={ _ => this.handleMouseLeave() }
                                class={ [this.getRowClass(row, $index)] }>
                                {
                                this._l(this.columns, (column, cellIndex) => {
                                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)

                                  if (!rowspan || !colspan) {
                                    return ''
                                  } else {
                                    if (rowspan === 1 && colspan === 1) {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    } else {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            rowspan={ rowspan }
                                            colspan={ colspan }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    }
                                  }
                                })
                                }
                            </tr>,
                this.store.isRowExpanded(row)
                                ? (<tr>
                                <td colspan={ this.columns.length } class="el-table__expanded-cell">
                                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                                </td>
                                </tr>)
                                : ''
              ]
              )
            }
                ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
                )
            }
            </tbody>
            <tbody class="icore-big-data-body-third">
            {this._l(this.data.slice((this.bigDataShow[0] * 2 + this.thirdShow * this.bigDataShow[0] * 8), (this.bigDataShow[0] * 3 + this.thirdShow * this.bigDataShow[0] * 8)), (row, $index) => {
              let $indexData = this.bigDataShow[0] * 2 + this.thirdShow * this.bigDataShow[0] * 8 + $index
              $index = this.bigDataShow[0] * 2 + $index
              return (
              [<tr
                                draggable = {!!this.dragRow}
                                on-drop={ ($event) => this.dropRowSet($event, $index)}
                                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                                on-dragover={ ($event) => this.dropRowOver($event) }
                                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                                on-click={ ($event) => this.handleClick($event, row) }
                                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                                on-mouseenter={ _ => this.handleMouseEnter($index) }
                                on-mouseleave={ _ => this.handleMouseLeave() }
                                class={ [this.getRowClass(row, $index)] }>
                                {
                                this._l(this.columns, (column, cellIndex) => {
                                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)

                                  if (!rowspan || !colspan) {
                                    return ''
                                  } else {
                                    if (rowspan === 1 && colspan === 1) {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    } else {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            rowspan={ rowspan }
                                            colspan={ colspan }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    }
                                  }
                                })
                                }
                            </tr>,
                this.store.isRowExpanded(row)
                                ? (<tr>
                                <td colspan={ this.columns.length } class="el-table__expanded-cell">
                                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                                </td>
                                </tr>)
                                : ''
              ]
              )
            }
                ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
                )
            }
            </tbody>
            <tbody class="icore-big-data-body-fourth">
            {this._l(this.data.slice((this.bigDataShow[0] * 3 + this.fourthShow * this.bigDataShow[0] * 8), (this.bigDataShow[0] * 4 + this.fourthShow * this.bigDataShow[0] * 8)), (row, $index) => {
              let $indexData = this.bigDataShow[0] * 3 + this.fourthShow * this.bigDataShow[0] * 8 + $index
              $index = this.bigDataShow[0] * 3 + $index
              return (
              [<tr
                                draggable = {!!this.dragRow}
                                on-drop={ ($event) => this.dropRowSet($event, $index)}
                                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                                on-dragover={ ($event) => this.dropRowOver($event) }
                                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                                on-click={ ($event) => this.handleClick($event, row) }
                                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                                on-mouseenter={ _ => this.handleMouseEnter($index) }
                                on-mouseleave={ _ => this.handleMouseLeave() }
                                class={ [this.getRowClass(row, $index)] }>
                                {
                                this._l(this.columns, (column, cellIndex) => {
                                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)

                                  if (!rowspan || !colspan) {
                                    return ''
                                  } else {
                                    if (rowspan === 1 && colspan === 1) {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    } else {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            rowspan={ rowspan }
                                            colspan={ colspan }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    }
                                  }
                                })
                                }
                            </tr>,
                this.store.isRowExpanded(row)
                                ? (<tr>
                                <td colspan={ this.columns.length } class="el-table__expanded-cell">
                                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                                </td>
                                </tr>)
                                : ''
              ]
              )
            }
                ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
                )
            }
            </tbody>
            <tbody class="icore-big-data-body-fifth">
            {this._l(this.data.slice((this.bigDataShow[0] * 4 + this.bigDataShow[0] * 8 * this.fifthShow), (this.bigDataShow[0] * 8 * this.fifthShow + this.bigDataShow[0] * 5)), (row, $index) => {
              let $indexData = this.bigDataShow[0] * 4 + this.bigDataShow[0] * 8 * this.fifthShow + $index
              $index = this.bigDataShow[0] * 4 + $index
              return (
              [<tr
                                draggable = {!!this.dragRow}
                                on-drop={ ($event) => this.dropRowSet($event, $index)}
                                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                                on-dragover={ ($event) => this.dropRowOver($event) }
                                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                                on-click={ ($event) => this.handleClick($event, row) }
                                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                                on-mouseenter={ _ => this.handleMouseEnter($index) }
                                on-mouseleave={ _ => this.handleMouseLeave() }
                                class={ [this.getRowClass(row, $index)] }>
                                {
                                this._l(this.columns, (column, cellIndex) => {
                                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)

                                  if (!rowspan || !colspan) {
                                    return ''
                                  } else {
                                    if (rowspan === 1 && colspan === 1) {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    } else {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            rowspan={ rowspan }
                                            colspan={ colspan }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    }
                                  }
                                })
                                }
                            </tr>,
                this.store.isRowExpanded(row)
                                ? (<tr>
                                <td colspan={ this.columns.length } class="el-table__expanded-cell">
                                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                                </td>
                                </tr>)
                                : ''
              ]
              )
            }
                ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
                )
            }
            </tbody>
            <tbody class="icore-big-data-body-sixth">
            {this._l(this.data.slice((this.bigDataShow[0] * 5 + this.sixthShow * this.bigDataShow[0] * 8), (this.bigDataShow[0] * 6 + this.sixthShow * this.bigDataShow[0] * 8)), (row, $index) => {
              let $indexData = this.bigDataShow[0] * 5 + this.sixthShow * this.bigDataShow[0] * 8 + $index
              $index = this.bigDataShow[0] * 5 + $index
              return (
              [<tr
                                draggable = {!!this.dragRow}
                                on-drop={ ($event) => this.dropRowSet($event, $index)}
                                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                                on-dragover={ ($event) => this.dropRowOver($event) }
                                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                                on-click={ ($event) => this.handleClick($event, row) }
                                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                                on-mouseenter={ _ => this.handleMouseEnter($index) }
                                on-mouseleave={ _ => this.handleMouseLeave() }
                                class={ [this.getRowClass(row, $index)] }>
                                {
                                this._l(this.columns, (column, cellIndex) => {
                                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)

                                  if (!rowspan || !colspan) {
                                    return ''
                                  } else {
                                    if (rowspan === 1 && colspan === 1) {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    } else {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            rowspan={ rowspan }
                                            colspan={ colspan }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    }
                                  }
                                })
                                }
                            </tr>,
                this.store.isRowExpanded(row)
                                ? (<tr>
                                <td colspan={ this.columns.length } class="el-table__expanded-cell">
                                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                                </td>
                                </tr>)
                                : ''
              ]
              )
            }
                ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
                )
            }
            </tbody>
            <tbody class="icore-big-data-body-seventh">
            {this._l(this.data.slice((this.bigDataShow[0] * 6 + this.seventhShow * this.bigDataShow[0] * 8), (this.bigDataShow[0] * 7 + this.seventhShow * this.bigDataShow[0] * 8)), (row, $index) => {
              let $indexData = this.bigDataShow[0] * 6 + this.seventhShow * this.bigDataShow[0] * 8 + $index
              $index = this.bigDataShow[0] * 6 + $index
              return (
              [<tr
                                draggable = {!!this.dragRow}
                                on-drop={ ($event) => this.dropRowSet($event, $index)}
                                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                                on-dragover={ ($event) => this.dropRowOver($event) }
                                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                                on-click={ ($event) => this.handleClick($event, row) }
                                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                                on-mouseenter={ _ => this.handleMouseEnter($index) }
                                on-mouseleave={ _ => this.handleMouseLeave() }
                                class={ [this.getRowClass(row, $index)] }>
                                {
                                this._l(this.columns, (column, cellIndex) => {
                                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)

                                  if (!rowspan || !colspan) {
                                    return ''
                                  } else {
                                    if (rowspan === 1 && colspan === 1) {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    } else {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            rowspan={ rowspan }
                                            colspan={ colspan }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    }
                                  }
                                })
                                }
                            </tr>,
                this.store.isRowExpanded(row)
                                ? (<tr>
                                <td colspan={ this.columns.length } class="el-table__expanded-cell">
                                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                                </td>
                                </tr>)
                                : ''
              ]
              )
            }
                ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
                )
            }
            </tbody>
            <tbody class="icore-big-data-body-eighth">
            {this._l(this.data.slice((this.bigDataShow[0] * 7 + this.eighthShow * this.bigDataShow[0] * 8), (this.bigDataShow[0] * 8 + this.eighthShow * this.bigDataShow[0] * 8)), (row, $index) => {
              let $indexData = this.bigDataShow[0] * 7 + this.eighthShow * this.bigDataShow[0] * 8 + $index
              $index = this.bigDataShow[0] * 7 + $index
              return (
              [<tr
                                draggable = {!!this.dragRow}
                                on-drop={ ($event) => this.dropRowSet($event, $index)}
                                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                                on-dragover={ ($event) => this.dropRowOver($event) }
                                style={ this.rowStyle ? this.getRowStyle(row, $index) : null }
                                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                                on-click={ ($event) => this.handleClick($event, row) }
                                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                                on-mouseenter={ _ => this.handleMouseEnter($index) }
                                on-mouseleave={ _ => this.handleMouseLeave() }
                                class={ [this.getRowClass(row, $index)] }>
                                {
                                this._l(this.columns, (column, cellIndex) => {
                                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)

                                  if (!rowspan || !colspan) {
                                    return ''
                                  } else {
                                    if (rowspan === 1 && colspan === 1) {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    } else {
                                      return (
                                        <td
                                            style={ this.getCellStyle($index, cellIndex, row, column)
                                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                                : (row._blank ? 'text-indent: 10%;' : '')
                                            }
                                            class={ this.getCellClass($index, cellIndex, row, column) }
                                            rowspan={ rowspan }
                                            colspan={ colspan }
                                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                                            on-mouseleave={ this.handleCellMouseLeave }>
                                            {
                                            column.renderCell.call(
                                                this._renderProxy,
                                                h,
                                              {
                                                row,
                                                column,
                                                $index,
                                                store: this.store,
                                                _self: this.context || this.table.$vnode.context,
                                                $indexData
                                              },
                                                columnsHidden[cellIndex]
                                            )
                                            }
                                        </td>
                                      )
                                    }
                                  }
                                })
                                }
                            </tr>,
                this.store.isRowExpanded(row)
                                ? (<tr>
                                <td colspan={ this.columns.length } class="el-table__expanded-cell">
                                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                                </td>
                                </tr>)
                                : ''
              ]
              )
            }
                ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
                )
            }
            </tbody>
            <tbody>
                {
                   (
                        <tr style={'height:' + (dataL === 0 ? 1 : (((dataL - this.bigDataShow[0] * 8) > 0 ? (dataL - this.bigDataShow[0] * 8) : 0) * this.recordShow[2])) + 'px;'}></tr>
                    )
                }
            </tbody>
        </table>
       : <table
        class="el-table__body"
        cellspacing="0"
        cellpadding="0"
        border="0">
        <colgroup>
            {
                this._l(this.columns, column => <col name={ column.id } />)
            }
        </colgroup>
        <tbody>
            {this._l(this.data, (row, $index) =>
              [<tr
                draggable = {!!this.dragRow}
                on-drop={ ($event) => this.dropRowSet($event, $index)}
                on-dragstart={ ($event) => this.dropRowStart($event, $index) }
                on-dragover={ ($event) => this.dropRowOver($event) }
                style={ this.rowStyle ? this.getRowStyle(row, $index) + (row._blank ? 'display:none;' : '') : row._blank ? 'display:none;' : null }
                key={ this.table.rowKey ? this.getKeyOfRow(row, $index) : $index }
                on-dblclick={ ($event) => this.handleDoubleClick($event, row) }
                on-click={ ($event) => this.handleClick($event, row) }
                on-contextmenu={ ($event) => this.handleContextMenu($event, row) }
                on-mouseenter={ _ => this.handleMouseEnter($index) }
                on-mouseleave={ _ => this.handleMouseLeave() }
                class={ [this.getRowClass(row, $index), row._blank ? row._blank_class : ''] }>
                {
                    this._l(this.columns, (column, cellIndex) => {
                      const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex)
                      if (!rowspan || !colspan) {
                        return ''
                      } else {
                        if (rowspan === 1 && colspan === 1) {
                          return (
                            <td
                            style={ this.getCellStyle($index, cellIndex, row, column)
                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                : (row._blank ? 'text-indent: 10%;' : '')
                            }
                            class={ this.getCellClass($index, cellIndex, row, column) }
                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                            on-mouseleave={ this.handleCellMouseLeave }>
                            {
                                row.isTop && cellIndex === 0 ? <i class="el-icon-arrow-right" on-click={ ($event) => this.changeChildren($event, row) }
                                style="position:absolute; right:10px; top:50%; transform: translateY(-50%);
                                cursor: pointer;"></i> : ''
                            }
                            {
                                column.renderCell.call(
                                this._renderProxy,
                                h,
                                  {
                                    row,
                                    column,
                                    $index,
                                    store: this.store,
                                    _self: this.context || this.table.$vnode.context
                                  },
                                columnsHidden[cellIndex]
                                )
                            }
                            </td>
                          )
                        } else {
                          return (
                            <td
                            style={ this.getCellStyle($index, cellIndex, row, column)
                                ? this.getCellStyle($index, cellIndex, row, column) + (row._blank ? 'text-indent: 10%;' : '')
                                : (row._blank ? 'text-indent: 10%;' : '')
                            }
                            class={ this.getCellClass($index, cellIndex, row, column) }
                            rowspan={ rowspan }
                            colspan={ colspan }
                            on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                            on-mouseleave={ this.handleCellMouseLeave }>
                            {
                                row.isTop && cellIndex === 0 ? <i class="el-icon-arrow-right" on-click={ ($event) => this.changeChildren($event, row) }
                                style="position:absolute; right:10px; top:50%; transform: translateY(-50%);
                                cursor: pointer;"></i> : ''
                            }
                            {
                                column.renderCell.call(
                                this._renderProxy,
                                h,
                                  {
                                    row,
                                    column,
                                    $index,
                                    store: this.store,
                                    _self: this.context || this.table.$vnode.context
                                  },
                                columnsHidden[cellIndex]
                                )
                            }
                            </td>
                          )
                        }
                      }
                    })
                }
                </tr>,
                this.store.isRowExpanded(row)
                ? (<tr>
                    <td colspan={ this.columns.length } class="el-table__expanded-cell">
                    { this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                    </td>
                </tr>)
                : ''
              ]
            ).concat(
                <el-tooltip effect={ this.table.tooltipEffect } placement="top" ref="tooltip" content={ this.tooltipContent }></el-tooltip>
            )
            }
        </tbody>
        </table>
    )
  },

  watch: {
    recordScrollTop (n, o) {
      let that = this
      that.changeShown(that.$parent.scrollFlag)
        // that.setNewVal(tempF, tempS, tempT, tempFt, tempFi, tempSi, tempSe, tempE);
        // that.firstShow = tempF;
        // that.secondShow = tempS;
    },
    'store.states.hoverRow' (newVal, oldVal) {
      if (!this.store.states.isComplex) return
      const el = this.$el
      if (!el) return
      let tr
      if (this.recordShow.length > 1) {
        tr = el.getElementsByTagName('tr')
      } else {
        tr = el.querySelector('tbody').children
      }
      const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'))
      const oldRow = rows[oldVal]
      const newRow = rows[newVal]
      if (oldRow) {
        removeClass(oldRow, 'hover-row')
      }
      if (newRow) {
        addClass(newRow, 'hover-row')
      }
    },
    'store.states.currentRow' (newVal, oldVal) {
      if (!this.highlight) return
      const el = this.$el
      if (!el) return
      const data = this.store.states.data
      const tr = el.querySelector('tbody').children
      const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'))
      const oldRow = rows[data.indexOf(oldVal)]
      const newRow = rows[data.indexOf(newVal)]
      if (oldRow) {
        removeClass(oldRow, 'current-row')
      } else {
        [].forEach.call(rows, row => removeClass(row, 'current-row'))
      }
      if (newRow) {
        addClass(newRow, 'current-row')
      }
    }
  },

  computed: {
    table () {
      return this.$parent
    },

    data () {
      return this.store.states.data
    },

    columnsCount () {
      return this.store.states.columns.length
    },

    leftFixedLeafCount () {
      return this.store.states.fixedLeafColumnsLength
    },

    rightFixedLeafCount () {
      return this.store.states.rightFixedLeafColumnsLength
    },

    leftFixedCount () {
      return this.store.states.fixedColumns.length
    },

    rightFixedCount () {
      return this.store.states.rightFixedColumns.length
    },

    columns () {
      return this.store.states.columns
    }
  },

  data () {
    return {
      tooltipContent: '',
      secondShow: 0,
      firstShow: 0,
      thirdShow: 0,
      fourthShow: 0,
      fifthShow: 0,
      sixthShow: 0,
      seventhShow: 0,
      eighthShow: 0
    }
  },

  created () {
    this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper())
  },

  methods: {
    changeShown (flag) {
      let that = this
      let tempF = 0
      let tempS = 0
      let tempT = 0
      let tempFt = 0
      let tempFi = 0
      let tempSi = 0
      let tempSe = 0
      let tempE = 0
      let sbShownCount = 0
      let sbShownCount1 = 0
      let sbShownCount2 = 0
      let sbShownCount3 = 0
      let sbShownCount4 = 0
      let sbShownCount5 = 0
      let sbShownCount6 = 0
      let sbShownCount7 = 0
      if ((that.recordScrollTop > (that.bigDataShow[0] * 8)) && that.recordScrollTop > ((that.data.length - that.bigDataShow[0] * 8) * that.recordShow[2])) {
        let temp = parseInt(that.data.length / (that.bigDataShow[0] * 8))
        let sbcount = that.data.length - temp * that.bigDataShow[0] * 8
        if (sbcount <= 0) {
          temp = temp - 1
          tempF = temp
          tempS = temp
          tempT = temp
          tempFt = temp
          tempFi = temp
          tempSi = temp
          tempSe = temp
          tempE = temp
        } else if (sbcount <= that.bigDataShow[0]) {
          sbShownCount = that.bigDataShow[0] - sbcount
          tempF = temp
          tempS = temp - 1
          tempT = temp - 1
          tempFt = temp - 1
          tempFi = temp - 1
          tempSi = temp - 1
          tempSe = temp - 1
          tempE = temp - 1
        } else if (sbcount <= that.bigDataShow[0] * 2) {
          sbShownCount = that.bigDataShow[0] * 2 - sbcount
          sbShownCount1 = that.bigDataShow[0] * 2 - sbcount
          tempF = temp
          tempS = temp
          tempT = temp - 1
          tempFt = temp - 1
          tempFi = temp - 1
          tempSi = temp - 1
          tempSe = temp - 1
          tempE = temp - 1
        } else if (sbcount <= that.bigDataShow[0] * 3) {
          sbShownCount = that.bigDataShow[0] * 3 - sbcount
          sbShownCount1 = that.bigDataShow[0] * 3 - sbcount
          sbShownCount2 = that.bigDataShow[0] * 3 - sbcount
          tempF = temp
          tempS = temp
          tempT = temp
          tempFt = temp - 1
          tempFi = temp - 1
          tempSi = temp - 1
          tempSe = temp - 1
          tempE = temp - 1
        } else if (sbcount <= that.bigDataShow[0] * 4) {
          sbShownCount = that.bigDataShow[0] * 4 - sbcount
          sbShownCount1 = that.bigDataShow[0] * 4 - sbcount
          sbShownCount2 = that.bigDataShow[0] * 4 - sbcount
          sbShownCount3 = that.bigDataShow[0] * 4 - sbcount
          tempF = temp
          tempS = temp
          tempT = temp
          tempFt = temp
          tempFi = temp - 1
          tempSi = temp - 1
          tempSe = temp - 1
          tempE = temp - 1
        } else if (sbcount <= that.bigDataShow[0] * 5) {
          sbShownCount = that.bigDataShow[0] * 5 - sbcount
          sbShownCount1 = that.bigDataShow[0] * 5 - sbcount
          sbShownCount2 = that.bigDataShow[0] * 5 - sbcount
          sbShownCount3 = that.bigDataShow[0] * 5 - sbcount
          sbShownCount4 = that.bigDataShow[0] * 5 - sbcount
          tempF = temp
          tempS = temp
          tempT = temp
          tempFt = temp
          tempFi = temp
          tempSi = temp - 1
          tempSe = temp - 1
          tempE = temp - 1
        } else if (sbcount <= that.bigDataShow[0] * 6) {
          sbShownCount = that.bigDataShow[0] * 6 - sbcount
          sbShownCount1 = that.bigDataShow[0] * 6 - sbcount
          sbShownCount2 = that.bigDataShow[0] * 6 - sbcount
          sbShownCount3 = that.bigDataShow[0] * 6 - sbcount
          sbShownCount4 = that.bigDataShow[0] * 6 - sbcount
          sbShownCount5 = that.bigDataShow[0] * 6 - sbcount
          tempF = temp
          tempS = temp
          tempT = temp
          tempFt = temp
          tempFi = temp
          tempSi = temp
          tempSe = temp - 1
          tempE = temp - 1
        } else if (sbcount <= that.bigDataShow[0] * 7) {
          sbShownCount = that.bigDataShow[0] * 7 - sbcount
          sbShownCount1 = that.bigDataShow[0] * 7 - sbcount
          sbShownCount2 = that.bigDataShow[0] * 7 - sbcount
          sbShownCount3 = that.bigDataShow[0] * 7 - sbcount
          sbShownCount4 = that.bigDataShow[0] * 7 - sbcount
          sbShownCount5 = that.bigDataShow[0] * 7 - sbcount
          sbShownCount6 = that.bigDataShow[0] * 7 - sbcount
          tempF = temp
          tempS = temp
          tempT = temp
          tempFt = temp
          tempFi = temp
          tempSi = temp
          tempSe = temp
          tempE = temp - 1
        } else if (sbcount <= that.bigDataShow[0] * 8) {
          sbShownCount = that.bigDataShow[0] * 8 - sbcount
          sbShownCount1 = that.bigDataShow[0] * 8 - sbcount
          sbShownCount2 = that.bigDataShow[0] * 8 - sbcount
          sbShownCount3 = that.bigDataShow[0] * 8 - sbcount
          sbShownCount4 = that.bigDataShow[0] * 8 - sbcount
          sbShownCount5 = that.bigDataShow[0] * 8 - sbcount
          sbShownCount6 = that.bigDataShow[0] * 8 - sbcount
          sbShownCount7 = that.bigDataShow[0] * 8 - sbcount
          tempF = temp
          tempS = temp
          tempT = temp
          tempFt = temp
          tempFi = temp
          tempSi = temp
          tempSe = temp
          tempE = temp
        }
      } else {
        let firstCount = parseInt(that.bigDataShow[0] / 2 * 3)
        let secondCount = parseInt(that.bigDataShow[0] / 2 * 5)
        let thirdCount = parseInt(that.bigDataShow[0] / 2 * 7)
        let fourthCount = parseInt(that.bigDataShow[0] / 2 * 9)

        let fifthCount = parseInt(that.bigDataShow[0] / 2 * 11)
        let sixthCount = parseInt(that.bigDataShow[0] / 2 * 13)
        let seventhCount = parseInt(that.bigDataShow[0] / 2 * 15)
        let eighthCount = parseInt(that.bigDataShow[0] / 2 * 17)

        let scrollCount = parseInt(that.recordScrollTop / that.recordShow[2])
        tempF = parseInt((scrollCount - firstCount) / that.bigDataShow[0] / 8) + (scrollCount - firstCount > 0 ? 1 : 0)
        tempS = parseInt((scrollCount - secondCount) / that.bigDataShow[0] / 8) + (scrollCount - secondCount > 0 ? 1 : 0)
        tempT = parseInt((scrollCount - thirdCount) / that.bigDataShow[0] / 8) + (scrollCount - thirdCount > 0 ? 1 : 0)
        tempFt = parseInt((scrollCount - fourthCount) / that.bigDataShow[0] / 8) + (scrollCount - fourthCount > 0 ? 1 : 0)

        tempFi = parseInt((scrollCount - fifthCount) / that.bigDataShow[0] / 8) + (scrollCount - fifthCount > 0 ? 1 : 0)
        tempSi = parseInt((scrollCount - sixthCount) / that.bigDataShow[0] / 8) + (scrollCount - sixthCount > 0 ? 1 : 0)
        tempSe = parseInt((scrollCount - seventhCount) / that.bigDataShow[0] / 8) + (scrollCount - seventhCount > 0 ? 1 : 0)
        tempE = parseInt((scrollCount - eighthCount) / that.bigDataShow[0] / 8) + (scrollCount - eighthCount > 0 ? 1 : 0)
        tempE = tempE < 0 ? 0 : tempE
      }
      that.$el.getElementsByClassName('icore-big-data-body-first')[0].style.transform = 'translateY(' + (this.bigDataShow[0] * this.recordShow[2] * 8 * tempF - (this.recordShow[2] * sbShownCount)) + 'px)'
      that.$el.getElementsByClassName('icore-big-data-body-second')[0].style.transform = 'translateY(' + (this.bigDataShow[0] * this.recordShow[2] * 8 * tempS - (this.recordShow[2] * sbShownCount1)) + 'px)'
      that.$el.getElementsByClassName('icore-big-data-body-third')[0].style.transform = 'translateY(' + (this.bigDataShow[0] * this.recordShow[2] * 8 * tempT - (this.recordShow[2] * sbShownCount2)) + 'px)'
      that.$el.getElementsByClassName('icore-big-data-body-fourth')[0].style.transform = 'translateY(' + (this.bigDataShow[0] * this.recordShow[2] * 8 * tempFt - (this.recordShow[2] * sbShownCount3)) + 'px)'

      that.$el.getElementsByClassName('icore-big-data-body-fifth')[0].style.transform = 'translateY(' + (this.bigDataShow[0] * this.recordShow[2] * 8 * tempFi - (this.recordShow[2] * sbShownCount4)) + 'px)'
      that.$el.getElementsByClassName('icore-big-data-body-sixth')[0].style.transform = 'translateY(' + (this.bigDataShow[0] * this.recordShow[2] * 8 * tempSi - (this.recordShow[2] * sbShownCount5)) + 'px)'
      that.$el.getElementsByClassName('icore-big-data-body-seventh')[0].style.transform = 'translateY(' + (this.bigDataShow[0] * this.recordShow[2] * 8 * tempSe - (this.recordShow[2] * sbShownCount6)) + 'px)'
      that.$el.getElementsByClassName('icore-big-data-body-eighth')[0].style.transform = 'translateY(' + (this.bigDataShow[0] * this.recordShow[2] * 8 * tempE - (this.recordShow[2] * sbShownCount7)) + 'px)'
      if (flag) {
        that.setNewVal(tempF, tempS, tempT, tempFt, tempFi, tempSi, tempSe, tempE)
        that.$nextTick(() => {
          that.$parent.scrollFlag = false
        })
      }
    },
    setNewVal (tempF, tempS, tempT, tempFt, tempFi, tempSi, tempSe, tempE) {
      this.firstShow = tempF
      this.secondShow = tempS
      this.thirdShow = tempT
      this.fourthShow = tempFt
      this.fifthShow = tempFi
      this.sixthShow = tempSi
      this.seventhShow = tempSe
      this.eighthShow = tempE
    },
    getKeyOfRow (row, index) {
      const rowKey = this.table.rowKey
      if (rowKey) {
        return getRowIdentity(row, rowKey)
      }
      return index
    },

    isColumnHidden (index) {
      if (this.fixed === true || this.fixed === 'left') {
        return index >= this.leftFixedLeafCount
      } else if (this.fixed === 'right') {
        return index < this.columnsCount - this.rightFixedLeafCount
      } else {
        return (index < this.leftFixedLeafCount) || (index >= this.columnsCount - this.rightFixedLeafCount)
      }
    },

    getSpan (row, column, rowIndex, columnIndex) {
      let rowspan = 1
      let colspan = 1

      const fn = this.table.spanMethod
      if (typeof fn === 'function') {
        const result = fn({
          row,
          column,
          rowIndex,
          columnIndex
        })

        if (Array.isArray(result)) {
          rowspan = result[0]
          colspan = result[1]
        } else if (typeof result === 'object') {
          rowspan = result.rowspan
          colspan = result.colspan
        }
      }

      return {
        rowspan,
        colspan
      }
    },

    getRowStyle (row, rowIndex) {
      const rowStyle = this.table.rowStyle
      if (typeof rowStyle === 'function') {
        return rowStyle.call(null, {
          row,
          rowIndex
        })
      }
      return rowStyle
    },

    getRowClass (row, rowIndex) {
      const currentRow = this.store.states.currentRow
      const classes = this.table.highlightCurrentRow && currentRow === row
        ? ['el-table__row', 'current-row']
        : ['el-table__row']

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('el-table__row--striped')
      }
      const rowClassName = this.table.rowClassName
      if (typeof rowClassName === 'string') {
        classes.push(rowClassName)
      } else if (typeof rowClassName === 'function') {
        classes.push(rowClassName.call(null, {
          row,
          rowIndex
        }))
      }

      if (this.store.states.expandRows.indexOf(row) > -1) {
        classes.push('expanded')
      }

      return classes.join(' ')
    },

    getCellStyle (rowIndex, columnIndex, row, column) {
      const cellStyle = this.table.cellStyle
      if (typeof cellStyle === 'function') {
        return cellStyle.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        })
      }
      return cellStyle
    },

    getCellClass (rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.align, column.className]

      if (this.isColumnHidden(columnIndex)) {
        classes.push('is-hidden')
      }

      if (column.whiteSpaceNowrap) {
        let _div = document.createElement('div')
        _div.style.position = 'absolute'
        _div.style.opacity = '0'
        _div.style['white-space'] = 'nowrap'
        _div.innerHTML = row[column.property] ? row[column.property] : ''
        $('body').append(_div)
        var realWIdth = _div.scrollWidth
        $(_div).remove()

        if (column.realWidth != null && column.realWidth > realWIdth || column.width > realWIdth || column.minWidth > realWIdth) {
          // TODO
        } else {
          column.width = column.realWidth = realWIdth + 50
        }
      }

      const cellClassName = this.table.cellClassName
      if (typeof cellClassName === 'string') {
        classes.push(cellClassName)
      } else if (typeof cellClassName === 'function') {
        classes.push(cellClassName.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        }))
      }

      return classes.join(' ')
    },

    handleCellMouseEnter (event, row) {
      const table = this.table
      const cell = getCell(event)

      if (cell) {
        const column = getColumnByCell(table, cell)
        const hoverState = table.hoverState = {cell, column, row}
        table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event)
      }

      // 判断是否text-overflow, 如果是就显示tooltip
      const cellChild = event.target.querySelector('.cell')
      if (!hasClass(cellChild, 'el-tooltip')) {
        return
      }
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange()
      range.setStart(cellChild, 0)
      range.setEnd(cellChild, cellChild.childNodes.length)
      const rangeWidth = range.getBoundingClientRect().width
      const padding = (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
        (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0)
      if ((rangeWidth + padding > cellChild.offsetWidth || cellChild.scrollWidth > cellChild.offsetWidth) &&
            (this.$refs.tooltip && $(cellChild).find('input').length <= 0 || $(cellChild).find('input').css('display') == 'none')) {
        const tooltip = this.$refs.tooltip
        // TODO 会引起整个 Table 的重新渲染，需要优化
        this.tooltipContent = cell.textContent || cell.innerText
        tooltip.referenceElm = cell
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
        tooltip.doDestroy()
        tooltip.setExpectedState(true)
        this.activateTooltip(tooltip)
      }
    },

    handleCellMouseLeave (event) {
      const tooltip = this.$refs.tooltip
      if (tooltip) {
        tooltip.setExpectedState(false)
        tooltip.handleClosePopper()
      }
      const cell = getCell(event)
      if (!cell) return

      const oldHoverState = this.table.hoverState || {}
      this.table.$emit('cell-mouse-leave', oldHoverState.row, oldHoverState.column, oldHoverState.cell, event)
    },

    handleMouseEnter (index) {
      this.store.commit('setHoverRow', index)
    },

    handleMouseLeave () {
      this.store.commit('setHoverRow', null)
    },

    handleContextMenu (event, row) {
      this.handleEvent(event, row, 'contextmenu')
    },

    handleDoubleClick (event, row) {
      let eventParent = event.target.parentNode.parentNode
      // 取消拖拽
      this.handleEvent(event, row, 'dblclick')
      $(eventParent).attr('draggable', false)
    },

    handleClick (event, row) {
      this.store.commit('setCurrentRow', row)
      this.handleEvent(event, row, 'click')
      let eventParent = event.target.parentNode.parentNode
      let allTr = $(eventParent).siblings()
        // 恢复拖拽
      if (this.dragRow) {
        if ($(eventParent).attr('draggable')) {
          for (let i = 0; i < allTr.length; i++) {
            $(allTr[i]).attr('draggable', true)
          }
        }
      }
    },

    handleEvent (event, row, name) {
      const table = this.table
      const cell = getCell(event)
      let column
      if (cell) {
        column = getColumnByCell(table, cell)
        if (column) {
          table.$emit(`cell-${name}`, row, column, cell, event)
        }
      }
      table.$emit(`row-${name}`, row, event, column)
    },

    handleExpandClick (row, e) {
      e.stopPropagation()
      this.store.toggleRowExpansion(row)
    },

    // 拖动行
    dropRowSet (event, index) {
      let that = this
      if (!that.dragRow) {
        return
      }
      that.dragEnd = index
      if (that.dragRow && that.dragStart != that.dragEnd) {
        that.store.changeRowOrder(that.dragStart, that.dragEnd)
      }
    },
    dropRowStart (event, index) {
      if (!this.dragRow) {
        return
      }
      this.dragStart = index
    },
    dropRowOver (event, index) {
      if (!this.dragRow) {
        return
      }
      event.preventDefault()
    },
    changeChildren (event, row) {
      let domLength = document.getElementsByClassName(row._blank_class).length
      if (document.getElementsByClassName(row._blank_class)[0].style.display) {
        for (let i = 0; i < domLength; i++) {
          document.getElementsByClassName(row._blank_class)[i].style.display = ''
        }
      } else {
        for (let i = 0; i < domLength; i++) {
          document.getElementsByClassName(row._blank_class)[i].style.display = 'none'
        }
      }
    }
  }
}
