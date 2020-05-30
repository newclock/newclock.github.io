import { hasClass, addClass, removeClass } from 'element-ui/src/utils/dom';
import ElCheckbox from 'element-ui/packages/checkbox';
import ElTag from 'element-ui/packages/tag';
import Vue from 'vue';
import FilterPanel from './filter-panel.vue';
import LayoutObserver from './layout-observer';
import TableLayout from './table-layout';
import icoreFilter from './icore-filter'

const getAllColumns = (columns) => {
  const result = [];
  columns.forEach((column) => {
    if (column.children) {
      result.push(column);
      result.push.apply(result, getAllColumns(column.children));
    } else {
      result.push(column);
    }
  });
  return result;
};

const convertToRows = (originColumns) => {
  let maxLevel = 1;
  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }
    if (column.children) {
      let colSpan = 0;
      column.children.forEach((subColumn) => {
        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = 1;
    }
  };

  originColumns.forEach((column) => {
    column.level = 1;
    traverse(column);
  });

  const rows = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  const allColumns = getAllColumns(originColumns);

  allColumns.forEach((column) => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1;
    } else {
      column.rowSpan = 1;
    }
    rows[column.level - 1].push(column);
  });

  return rows;
};

export default {
  name: 'ElTableHeader',

  mixins: [LayoutObserver],

  render(h) {
    const originColumns = this.store.states.originColumns;
    const columnRows = convertToRows(originColumns, this.columns);
    // 是否拥有多级表头
    const isGroup = columnRows.length > 1;
    if (isGroup) this.$parent.isGroup = true;
    return (
      <table
        class="el-table__header"
        cellspacing="0"
        cellpadding="0"
        border="0">
        <colgroup>
          {
            this._l(this.columns, column => <col name={ column.id } />)
          }
          {
            this.hasGutter ? <col name="gutter" /> : ''
          }
        </colgroup>
        <thead class={ [{ 'is-group': isGroup, 'has-gutter': this.hasGutter }] }>
          {
            this._l(columnRows, (columns, rowIndex) =>
              <tr
                style={ this.getHeaderRowStyle(rowIndex) }
                class={ this.getHeaderRowClass(rowIndex) }
              >
                {
                  this._l(columns, (column, cellIndex) =>
                    <th
                      on-dblclick={ ($event) => this.columndbClick($event, column )}
                    //   draggable={!column.fixed && this.dragColumn && column.level === 1}
                      draggable={false}
                      colspan={ column.colSpan }
                      rowspan={ column.rowSpan }
                      on-drop={ ($event) => this.dropColumnSet($event, column )}
                      on-dragstart={ ($event) => this.dropColumnStart($event, column) }
                      on-dragover={ ($event) => this.dropColumnOver($event, column) }
                      on-mousemove={ ($event) => this.handleMouseMove($event, column) }
                      on-mouseout={ this.handleMouseOut }
                      on-mousedown={ ($event) => this.handleMouseDown($event, column) }
                      on-click={ ($event) => this.handleHeaderClick($event, column) }
                      on-contextmenu={ ($event) => this.handleHeaderContextMenu($event, column) }
                      style={ this.getHeaderCellStyle(rowIndex, cellIndex, columns, column) }
                      class={ this.getHeaderCellClass(rowIndex, cellIndex, columns, column) }>
                      <div class={ ['cell', column.filteredValue && column.filteredValue.length > 0 ? 'highlight' : '', column.labelClassName] }>
                        {
                          column.renderHeader
                            ? column.renderHeader.call(this._renderProxy, h, { column, $index: cellIndex, store: this.store, _self: this.$parent.$vnode.context })
                            : column.label
                        }
                        {
                          column.sortable
                            ? <span class="caret-wrapper" on-click={ ($event) => this.handleSortClick($event, column) }>
                              <i class="sort-caret ascending" on-click={ ($event) => this.handleSortClick($event, column, 'ascending') }>
                              </i>
                              <i class="sort-caret descending" on-click={ ($event) => this.handleSortClick($event, column, 'descending') }>
                              </i>
                            </span>
                            : ''
                        }
                        {
                          column.filterable
                            ? <span class="el-table__column-filter-trigger" on-click={ ($event) => this.handleFilterClick($event, column) }><i class={ ['el-icon-arrow-down', column.filterOpened ? 'el-icon-arrow-up' : ''] }></i></span>
                            : ''
                        }
                      </div>
                      {!column.fixed && this.dragColumn && column.level === 1 ? 
                        <div style={"position:absolute;width:1px;height:" + this.$parent.bodyHeight.height}></div> : ''}
                    </th>
                  )
                }
                {
                  this.hasGutter ? <th class="gutter"></th> : ''
                }
              </tr>
            )
          }
        </thead>
        { this.icoreFilterFlag ? 
            <tr>
                {
                    this._l(this.columns, (column, cellIndex) => {
                        if (column.type !== 'default') {
                            return (<td></td>);
                        }
                        let data = [];
                        let exchangeFilterMap = this.exchangeFilterMap;
                        let filterSet = [{
                            label: '空',
                            value: ''
                        }];
                        if (this.recordShow.length > 1 && !column.shownFilterPanel) {
                            filterSet = [];
                            if (exchangeFilterMap[column.property]) {
                                for (let i in exchangeFilterMap[column.property]) {
                                    filterSet.push({
                                        label: exchangeFilterMap[column.property][i],
                                        value: i
                                    })
                                }
                            }
                        } else {
                            data = this.store.states._data;
                            let obj = {};
                            let filterTemp = [];
                            for (let i of data) {
                                if (i[column.property] === null || 
                                    i[column.property] === '' || 
                                    typeof(i[column.property]) === 'undefined'){
                                        continue;
                                }
                                if (!obj[i[column.property]]) {
                                    filterTemp.push({
                                        label: exchangeFilterMap[column.property] ? exchangeFilterMap[column.property][i[column.property]] : i[column.property],
                                        value: i[column.property]
                                    })
                                    obj[i[column.property]] = 1
                                } 
                            }
                            filterSet = filterTemp;
                        }
                        let setShown = false;
                        if (column.width) {
                            setShown = column.width < 100;
                        } else if (column.realWidth) {
                            setShown = column.realWidth < 100;
                        }
                        // if (setShown) {
                        //     this.store.states['columnCommand' + cellIndex] = '-';
                        // }
                        return (
                            <td style="padding:5px">
                                <div style="width:18px;display:inline-block;cursor:pointer">
                                    <el-dropdown size="small" trigger={'click'} placement={'bottom-start'} on-command={ (command) => this.handleCommand(command, column, cellIndex)}>
                                    <span class="el-dropdown-link">
                                        <div class={"icore-table-filter-" + 
                                            (this.store.states['columnCommand' + cellIndex] === '=' ? "equal" :
                                             this.store.states['columnCommand' + cellIndex] === '≠' ? "not-equal" :
                                             this.store.states['columnCommand' + cellIndex] === '<' ? "less" :
                                             this.store.states['columnCommand' + cellIndex] === '≤' ? "less-equal" :
                                             this.store.states['columnCommand' + cellIndex] === '>' ? "more" :
                                             this.store.states['columnCommand' + cellIndex] === '≥' ? "more-equal" :
                                             this.store.states['columnCommand' + cellIndex] === '*' ? "contains" :
                                             "free-set"
                                            )
                                        } style="width:16px;height:11px;"></div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item command="0">
                                        <span style="width:16px;height: 11px;display: inline-block;" class="icore-table-filter-equal"></span> 等于</el-dropdown-item>
                                        <el-dropdown-item command="1">
                                        <span style="width:16px;height: 11px;display: inline-block;" class="icore-table-filter-not-equal"></span> 不等于</el-dropdown-item>
                                        <el-dropdown-item disabled={setShown} command="2">
                                        <span style="width:16px;height: 11px;display: inline-block;" class="icore-table-filter-less"></span> 小于</el-dropdown-item>
                                        <el-dropdown-item disabled={setShown} command="3">
                                        <span style="width:16px;height: 11px;display: inline-block;" class="icore-table-filter-less-equal"></span> 小于等于</el-dropdown-item>
                                        <el-dropdown-item disabled={setShown} command="4">
                                        <span style="width:16px;height: 11px;display: inline-block;" class="icore-table-filter-more"></span> 大于</el-dropdown-item>
                                        <el-dropdown-item disabled={setShown} command="5">
                                        <span style="width:16px;height: 11px;display: inline-block;" class="icore-table-filter-more-equal"></span> 大于等于</el-dropdown-item>
                                        <el-dropdown-item disabled={setShown} command="6">
                                        <span style="width:16px;height: 11px;display: inline-block;" class="icore-table-filter-contains"></span> 模糊查找</el-dropdown-item> 
                                        <el-dropdown-item command="7">
                                        <span style="width:16px;height: 11px;display: inline-block;" class="icore-table-filter-free-set"></span> 自定义规则</el-dropdown-item>
                                    </el-dropdown-menu>
                                    </el-dropdown>
                                </div>
                                {
                                    this.store.states['columnCommand' + cellIndex] === '-' || 
                                    this.store.states['columnCommand' + cellIndex] === '=' || 
                                    this.store.states['columnCommand' + cellIndex] === '≠' ? 
                                                '' :
                                    <div style= "width: calc(100% - 38px);display: inline-block;margin-left: 4px;">
                                        <el-select
                                        size="small"
                                        allow-create={true}
                                        default-first-option={true}
                                        filterable={ true }
                                        ref={'columnVal' + cellIndex} 
                                        clearable={ true }
                                        title={this.store.states['columnFilterVal' + cellIndex]}
                                        value={this.store.states['columnFilterVal' + cellIndex]} 
                                        on-change={ (val) => this.changeFilter(val, column, cellIndex) } 
                                        filter-method={(val) => this.changeFilterMethod(val, column, cellIndex)}
                                        placeholder="筛选">
                                            { 
                                                this._l(filterSet, (option, optionIndex) => {
                                                    return (
                                                        <el-option
                                                        label={option.label}
                                                        value={option.value}>
                                                        </el-option>
                                                    )
                                                })
                                            }
                                        </el-select>
                                    </div> 
                                }

                                {
                                    this.store.states['columnCommand' + cellIndex] === '=' || 
                                    this.store.states['columnCommand' + cellIndex] === '≠' ?
                                    <div on-click={($event) => this.handleIcoreFilterClick($event, exchangeFilterMap, column, cellIndex)}
                                        style={this.panelSearchType(column, cellIndex) ? 
                                        'color: #409EFF;width: calc(100% - 38px);display: inline-block;margin-left: 4px;cursor:pointer;text-align: right;' :
                                        'width: calc(100% - 38px);display: inline-block;margin-left: 4px;cursor:pointer;text-align: right;'}
                                    >
                                        <i class="iconFont el-icon-arrow-down"></i>
                                    </div> : ''
                                }
                                
                                {
                                    this.store.states['columnCommand' + cellIndex] === '-'
                                    ?
                                    (<div on-click={ ($event) => this.showIndvDialog(column, cellIndex) }
                                        title={
                                            this.columnIndividualTitle(column, cellIndex)
                                        }
                                        style={this.columnIndividualTitle(column, cellIndex) ? 
                                            'color: #409EFF;width: calc(100% - 38px);display: inline-block;margin-left: 4px;cursor:pointer;text-align: right;' :
                                            'width: calc(100% - 38px);display: inline-block;margin-left: 4px;cursor:pointer;text-align: right;'}
                                        >
                                        <i class="el-icon-setting"></i>
                                    </div>) : ''
                                }
                            </td>
                        );
                    })
                }
            </tr> 
            : ''
          }
      </table>
    );
  },

  props: {
    fixed: String,
    store: {
      required: true
    },
    border: Boolean,
    dragColumn: [String, Boolean],
    checkedColumns: Array,    
    individualColumns: [String, Boolean], 
    individualInfo: [Object],
    defaultSort: {
      type: Object,
      default() {
        return {
          prop: '',
          order: ''
        };
      }
    },
    icoreFilterFlag: Boolean,
    exchangeFilterMap: Object,
    recordShow: Array,
    icorePanelShown: Number
  },
  watch: {
    individualInfo: function (n) {
        this.setCookieColumn(n);
    },
    
    checkedColumns: function (n) {
        this.setCheckedColumn(n);
    },
    'icoreFilterFlag'(newVal) {
        let that = this;
        let temp = []
        if (newVal) {
            // TODO
        } else {
            for (let i in that.icoreFilters) {
                that.icoreFilters[i].$destroy();
            }
            that.icoreFilters = {};
            for (let i = 0; i < that.store.states._data.length; i++) {
                temp.push(that.store.states._data[i]);
            }
            that.store.states.filterMapper = {};
            that.store.states.filterIndividualMap = {};
            that.store.states.data = temp;
            for (let i = 0; i < 200; i++) {
                that.store.states['columnFilterValArr' + i] = [];
                that.store.states['columnFilterVal' + i] = '';
                that.store.states['columnCommand' + i] = '=';
                that.store.states['columnIndividual' + i] = [];
            }
        }
        that.$nextTick(() => {
            that.$parent.layout.updateElsHeight();
        });
    },
  },
  
  components: {
    ElCheckbox,
    ElTag
  },

  computed: {
    data() {
        return this.store.states.data;
    },
    table() {
      return this.$parent;
    },

    isAllSelected() {
      return this.store.states.isAllSelected;
    },

    columnsCount() {
      return this.store.states.columns.length;
    },

    leftFixedCount() {
      return this.store.states.fixedColumns.length;
    },

    rightFixedCount() {
      return this.store.states.rightFixedColumns.length;
    },

    leftFixedLeafCount() {
      return this.store.states.fixedLeafColumnsLength;
    },

    rightFixedLeafCount() {
      return this.store.states.rightFixedLeafColumnsLength;
    },

    columns() {
      return this.store.states.columns;
    },

    hasGutter() {
      return !this.fixed && this.tableLayout.gutterWidth;
    }
  },

  created() {
    this.filterPanels = {};
    this.icoreFilters = {};
  },

  mounted() {
    const { prop, order } = this.defaultSort;
    this.store.commit('sort', { prop, order });
  },

  beforeDestroy() {
    const panels = this.filterPanels;
    for (let prop in panels) {
      if (panels.hasOwnProperty(prop) && panels[prop]) {
        panels[prop].$destroy(true);
      }
    }

    const icorepanels = this.icoreFilters;
    for (let prop in icorepanels) {
      if (panels.hasOwnProperty(prop) && panels[prop]) {
        panels[prop].$destroy(true);
      }
    }
  },

  methods: {
    panelSearchType(column, cellIndex) {
        let that = this;
        let title = that.store.states['columnFilterValArr' + cellIndex].toString();
        return title;
    },
    columnIndividualTitle(column, cellIndex) {
        let that = this;
        let title = '';
        let setTitleList = that.store.states['columnIndividual' + cellIndex];
        for (let i = 0; i < setTitleList.length; i++) {
            if (setTitleList[i].value && setTitleList[i].rule && setTitleList[i].linkRule) {
                title += (setTitleList[i].linkRule === '1' ? '并且' : '或者') + ' ' + column.label + ' ' + setTitleList[i].rule + ' ' + setTitleList[i].value + ' ';
            }
        }
        return title;
    },
    showIndvDialog(column, cellIndex) {
        let that = this;
        that.$emit('showIndvDialog', {
            "column": column,
            "cellIndex": cellIndex,
            "data": that.store.states._data,
            "vue": that
        });
    },
    handleCommand(command, column, cellIndex) {
        let that = this;
        let filterPanel = this.icoreFilters[column.id];
        if (filterPanel) {
            filterPanel.$destroy()
            delete this.icoreFilters[column.id];
        }
        switch (command) {
            case '0':
            that.store.states['columnCommand' + cellIndex] = '=';
            break;
            case '1':
            that.store.states['columnCommand' + cellIndex] = '≠';
            break;
            case '2':
            that.store.states['columnCommand' + cellIndex] = '<';
            break;
            case '3':
            that.store.states['columnCommand' + cellIndex] = '≤';
            break;
            case '4':
            that.store.states['columnCommand' + cellIndex] = '>';
            break;
            case '5':
            that.store.states['columnCommand' + cellIndex] = '≥';
            break;
            case '6':
            that.store.states['columnCommand' + cellIndex] = '*';
            break;
            case '7':
            that.store.states['columnCommand' + cellIndex] = '-';
            that.showIndvDialog(column, cellIndex);
            break;
            default:
            break;
        }
        that.icoreFilterMethod(column, cellIndex);
    },
    changeFilterMethod(val, column, cellIndex) {
        let that = this;
        if (val === null || val === '' || typeof(val) === 'undefined') {
            that.changeFilter(val, column, cellIndex);
        }
    },
    changeFilter(val, column, cellIndex) {
        let that = this;
        that.store.states['columnFilterVal' + cellIndex] = val;
        that.icoreFilterMethod(column, cellIndex);
    },
    icoreFilterMethod(column, cellIndex) {
        let that = this;
        that.store.commit('icoreFilterMethod', {
            column: column,
            cellIndex: cellIndex
        });
    },
    setCookieColumn(individualInfo) {
      let that = this;
      var columnOrderCookie = null;
      if (typeof(that.individualColumns) === 'string') {
        var tempCol = [];
        var tempEn = [];
        for (let i = 0; i < that.store.states.initColumns.length; i++) {
            tempCol.push(that.store.states.initColumns[i].label ? that.store.states.initColumns[i].label : 
                (that.store.states.initColumns[i].type === 'expand' ? '展开行' : 
                (that.store.states.initColumns[i].type === 'selection' ? '选择' :
                (that.store.states.initColumns[i].type === 'index' ? '序列' : ''))));
            tempEn.push(that.store.states.initColumns[i]);
        }
        that.$parent.recordColumnsEn = tempEn;
        that.$parent.recordColumns = tempCol;
        if (JSON.parse(individualInfo.cfgInfo)[that.individualColumns]) {
            that.$parent.checkedColumns = JSON.parse(individualInfo.cfgInfo)[that.individualColumns];
            that.$parent.checkedColumnsConfirm = JSON.parse(individualInfo.cfgInfo)[that.individualColumns];
        } else {
            that.$parent.checkedColumns = tempCol;
        }
        if (that.$parent.checkedColumns.length === that.$parent.recordColumns.length) {
            that.$parent.checkAll = true;
            that.$parent.isIndeterminate = false;
        } else {
            that.$parent.checkAll = false;
            that.$parent.isIndeterminate = true;
        }
      }
      if (typeof(that.dragColumn) === 'string') {
        if (JSON.parse(individualInfo.cfgInfo)[that.dragColumn]) {
          columnOrderCookie = JSON.parse(individualInfo.cfgInfo)[that.dragColumn];
          that.setColumnMounted(columnOrderCookie);
        } else {
          return;
        }
      }
    },
    setCheckedColumn(checkedColumns) {
        let that = this;
        that.$nextTick(function () {
            if (typeof(that.dragColumn) === 'string') {
                if (JSON.parse(that.individualInfo.cfgInfo)[that.dragColumn]) {
                    let columnOrderCookie = JSON.parse(that.individualInfo.cfgInfo)[that.dragColumn];
                    if (checkedColumns.length === columnOrderCookie.length) {
                        let orderFlag = true;
                        for (let f = 0; f < checkedColumns.length; f++) {
                            var result = columnOrderCookie.some (item => {
                                if (item === checkedColumns[f]) {
                                   return true 
                                } 
                            })
                            if (!result) {
                                orderFlag = false;
                                break;
                            }
                        }
                        if (orderFlag) {
                            that.setColumnMounted(columnOrderCookie);
                        }
                    }
                }
            }
            let array = that.store.states.initColumns;
            let temp = [];
            for (let k = 0; k < array.length; k++) {
                let tepm = (array[k].label ? array[k].label : 
                    (array[k].type === 'expand' ? '展开行' : 
                    (array[k].type === 'selection' ? '选择' : 
                    (array[k].type === 'index' ? '序列' : ''))));
                if ( checkedColumns.includes(tepm)) {
                    temp.push(array[k]);
                }
            }
            that.store.states._columns = temp;
            if (that.table.$ready) {
                that.store.updateColumns(); // hack for dynamics remove column
                that.store.scheduleLayout();
            }
        });
    },
    isCellHidden(index, columns) {
      let start = 0;
      for (let i = 0; i < index; i++) {
        start += columns[i].colSpan;
      }
      const after = start + columns[index].colSpan - 1;
      if (this.fixed === true || this.fixed === 'left') {
        return after >= this.leftFixedLeafCount;
      } else if (this.fixed === 'right') {
        return start < this.columnsCount - this.rightFixedLeafCount;
      } else {
        return (after < this.leftFixedLeafCount) || (start >= this.columnsCount - this.rightFixedLeafCount);
      }
    },

    getHeaderRowStyle(rowIndex) {
      const headerRowStyle = this.table.headerRowStyle;
      if (typeof headerRowStyle === 'function') {
        return headerRowStyle.call(null, { rowIndex });
      }
      return headerRowStyle;
    },

    getHeaderRowClass(rowIndex) {
      const classes = [];

      const headerRowClassName = this.table.headerRowClassName;
      if (typeof headerRowClassName === 'string') {
        classes.push(headerRowClassName);
      } else if (typeof headerRowClassName === 'function') {
        classes.push(headerRowClassName.call(null, { rowIndex }));
      }

      return classes.join(' ');
    },

    getHeaderCellStyle(rowIndex, columnIndex, row, column) {
      const headerCellStyle = this.table.headerCellStyle;
      if (typeof headerCellStyle === 'function') {
        return headerCellStyle.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        });
      }
      return headerCellStyle;
    },

    getHeaderCellClass(rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.order, column.headerAlign, column.className, column.labelClassName];

      if (rowIndex === 0 && this.isCellHidden(columnIndex, row)) {
        classes.push('is-hidden');
      }

      if (!column.children) {
        classes.push('is-leaf');
      }

      if (column.sortable) {
        classes.push('is-sortable');
      }

      const headerCellClassName = this.table.headerCellClassName;
      if (typeof headerCellClassName === 'string') {
        classes.push(headerCellClassName);
      } else if (typeof headerCellClassName === 'function') {
        classes.push(headerCellClassName.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        }));
      }

      return classes.join(' ');
    },

    toggleAllSelection() {
      this.store.commit('toggleAllSelection');
    },

    handleIcoreFilterClick(event, exchangeFilterMap, column, cellIndex) {
        event.stopPropagation();
        const target = event.target;
        let cell = target.tagName === 'TH' ? target : target.parentNode;
        cell = cell.querySelector('.el-table__column-filter-trigger') || cell;
        const table = this.$parent;
        let filterPanel = this.icoreFilters[column.id];
        if (filterPanel && filterPanel.showPopper === true) {
          filterPanel.showPopper = false;
          return;
        }
        if (!filterPanel) {
          filterPanel = new Vue(icoreFilter);
          this.icoreFilters[column.id] = filterPanel;
          filterPanel.table = table;
          filterPanel.cell = cell;
          filterPanel.cellIndex = cellIndex;
          filterPanel.exchangeFilterMap = exchangeFilterMap;
          filterPanel.column = column;
          filterPanel.icorePanelShown = this.icorePanelShown;
          !this.$isServer && filterPanel.$mount(document.createElement('div'));
        }
  
        setTimeout(() => {
          filterPanel.showPopper = true;
        }, 16);
    },

    handleFilterClick(event, column) {
      event.stopPropagation();
      const target = event.target;
      let cell = target.tagName === 'TH' ? target : target.parentNode;
      cell = cell.querySelector('.el-table__column-filter-trigger') || cell;
      const table = this.$parent;

      let filterPanel = this.filterPanels[column.id];

      if (filterPanel && column.filterOpened) {
        filterPanel.showPopper = false;
        return;
      }

      if (!filterPanel) {
        filterPanel = new Vue(FilterPanel);
        this.filterPanels[column.id] = filterPanel;
        if (column.filterPlacement) {
          filterPanel.placement = column.filterPlacement;
        }
        filterPanel.table = table;
        filterPanel.cell = cell;
        filterPanel.column = column;
        !this.$isServer && filterPanel.$mount(document.createElement('div'));
      }

      setTimeout(() => {
        filterPanel.showPopper = true;
      }, 16);
    },

    columndbClick(event, column) {
        let that = this;
        if (!that.individualColumns) {
            return;
        }
        that.$parent.dialogVisible = true;
    },

    dropColumnSet(event, column) {
      if(!(!column.fixed && this.dragColumn && column.level === 1)) {
        return;
      }
      this.dragEnd = $(event.target).offset().left;
      let target = event.target;
      while (target && !$(target).hasClass('el-table')) {
        target = target.parentNode;
      }
      this.setColumn(target);
    },

    setColumn(target) {
      let that = this;
      var ths = $(target).find('th');
      var prevTargets = [];
      var setTargets = [];
      for (let i = 0; i < ths.length; i++) {
        if ($(ths[i]).attr('draggable') === 'false') {
          continue;
        }
        if ($(ths[i]).offset().left === that.dragStart) {
          prevTargets.push(ths[i]);
        }
        if ($(ths[i]).offset().left === that.dragEnd) {
          setTargets.push(ths[i]);
        }
      }
      var preClassList = $(prevTargets[0])[0].classList;
      var preId = '';
      for (let i = 0; i < preClassList.length; i++) {
        if (preClassList[i].indexOf('el-table_') > -1) {
          preId = preClassList[i];
        }
      }
      if (!$(setTargets[0])[0]) {
        return;
      }
      var setClassList = $(setTargets[0])[0].classList;
      var setId = '';
      for (let i = 0; i < setClassList.length; i++) {
        if (setClassList[i].indexOf('el-table_') > -1) {
          setId = setClassList[i];
        }
      }
      let array = this.store.states._columns;
      let preIndex = 0;
      let setIndex = 0;
      for (let i = 0; i < array.length; i++) {
        if (array[i].id === preId) {
          preIndex = i;
        }
        if (array[i].id === setId) {
          setIndex = i;
        }
      }
      var temp = array[preIndex];
      array.splice(setIndex,0,temp);
      if (preIndex <= setIndex) {
        array.splice(preIndex,1);
      } else {
        array.splice(preIndex+1,1);
      }
      if (typeof(that.dragColumn) === 'string') {
        let temp = [];
        for (let i = 0; i < array.length; i++) {
          temp.push(array[i].label ? array[i].label : '');
        }
        that.$put('sysuseruicfgs', {
            userId: that.individualInfo.userId,
            userCode: that.individualInfo.userCode,
            uiId: that.individualInfo.uiId,
            cfgInfo: JSON.stringify({
                [that.dragColumn]: temp
            })
        }, '', that.individualInfo.cfgId).then(function (response) {
            if (response.data.succeed) {
                // TODO
            } else {
                console.error(response.data.resultMessage);
            }
        })
        .catch(function (error) {
            console.error(error);
        });
        // setCookie(that.dragColumn, JSON.stringify(temp), 9999, '/');
      }
      if (this.table.$ready) {
        this.store.updateColumns(); // hack for dynamics remove column
        this.store.scheduleLayout();
      }
    },

    setColumnMounted(columnOrderCookie) {
      let that = this;
      that.$nextTick(function () {
        let array = that.store.states._columns;
        let temp = [];
        for (let i = 0; i < columnOrderCookie.length; i++) {
          for (let k = 0; k < array.length; k++) {
            if ((array[k].label ? array[k].label : 
                (array[k].type === 'expand' ? '展开行' : 
                (array[k].type === 'selection' ? '选择' : 
                (array[k].type === 'index' ? '序列' : '')))) === columnOrderCookie[i]) {
              temp.push(array[k]);
              continue;
            }
          }
        }
        that.store.states._columns = temp;
        if (that.table.$ready) {
          that.store.updateColumns(); // hack for dynamics remove column
          that.store.scheduleLayout();
        }
      });
      
    },

    dropColumnStart(event, column) {
      if(!(!column.fixed && this.dragColumn && column.level === 1)) {
        return;
      }
      this.dragStart = $(event.target).offset().left;
    },

    dropColumnOver(event, column) {
      if(!(!column.fixed && this.dragColumn && column.level === 1)) {
        return;
      }
      event.preventDefault();
    },

    handleHeaderClick(event, column) {
      if (!column.filters && column.sortable) {
        this.handleSortClick(event, column);
      } else if (column.filters && !column.sortable) {
        this.handleFilterClick(event, column);
      }

      this.$parent.$emit('header-click', column, event);
    },

    handleHeaderContextMenu(event, column) {
      this.$parent.$emit('header-contextmenu', column, event);
    },

    handleMouseDown(event, column) {
      if (this.$isServer) return;
      if (column.children && column.children.length > 0) return;
      /* istanbul ignore if */
      if (this.draggingColumn && this.border) {
        this.dragging = true;

        this.$parent.resizeProxyVisible = true;

        const table = this.$parent;
        const tableEl = table.$el;
        const tableLeft = tableEl.getBoundingClientRect().left;
        const columnEl = this.$el.querySelector(`th.${column.id}`);
        const columnRect = columnEl.getBoundingClientRect();
        const minLeft = columnRect.left - tableLeft + 30;

        addClass(columnEl, 'noclick');

        this.dragState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        };

        const resizeProxy = table.$refs.resizeProxy;
        resizeProxy.style.left = this.dragState.startLeft + 'px';

        document.onselectstart = function() { return false; };
        document.ondragstart = function() { return false; };

        const handleMouseMove = (event) => {
          const deltaLeft = event.clientX - this.dragState.startMouseLeft;
          const proxyLeft = this.dragState.startLeft + deltaLeft;

          resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px';
        };

        const handleMouseUp = () => {
          if (this.dragging) {
            const {
              startColumnLeft,
              startLeft
            } = this.dragState;
            const finalLeft = parseInt(resizeProxy.style.left, 10);
            const columnWidth = finalLeft - startColumnLeft;
            column.width = column.realWidth = columnWidth;
            table.$emit('header-dragend', column.width, startLeft - startColumnLeft, column, event);

            this.store.scheduleLayout();

            document.body.style.cursor = '';
            this.dragging = false;
            this.draggingColumn = null;
            this.dragState = {};

            table.resizeProxyVisible = false;
          }

          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.onselectstart = null;
          document.ondragstart = null;

          setTimeout(function() {
            removeClass(columnEl, 'noclick');
          }, 0);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    },

    handleMouseMove(event, column) {
      if (column.children && column.children.length > 0) return;
      let target = event.target;
      while (target && target.tagName !== 'TH') {
        target = target.parentNode;
      }

      if (!column || !column.resizable) return;

      if (!this.dragging && this.border) {
        let rect = target.getBoundingClientRect();

        const bodyStyle = document.body.style;
        if (rect.width > 12 && rect.right - event.pageX < 8) {
          bodyStyle.cursor = 'col-resize';
          if (hasClass(target, 'is-sortable')) {
            target.style.cursor = 'col-resize';
          }
          this.draggingColumn = column;
        } else if (!this.dragging) {
          bodyStyle.cursor = '';
          if (hasClass(target, 'is-sortable')) {
            target.style.cursor = 'pointer';
          }
          this.draggingColumn = null;
        }
      }
    },

    handleMouseOut() {
      if (this.$isServer) return;
      document.body.style.cursor = '';
    },

    toggleOrder({ order, sortOrders }) {
      if (order === '') return sortOrders[0];
      const index = sortOrders.indexOf(order || null);
      return sortOrders[index > sortOrders.length - 2 ? 0 : index + 1];
    },

    handleSortClick(event, column, givenOrder) {
      event.stopPropagation();
      let order = givenOrder || this.toggleOrder(column);

      let target = event.target;
      while (target && target.tagName !== 'TH') {
        target = target.parentNode;
      }

      if (target && target.tagName === 'TH') {
        if (hasClass(target, 'noclick')) {
          removeClass(target, 'noclick');
          return;
        }
      }

      if (!column.sortable) return;

      const states = this.store.states;
      let sortProp = states.sortProp;
      let sortOrder;
      const sortingColumn = states.sortingColumn;

      if (sortingColumn !== column || (sortingColumn === column && sortingColumn.order === null)) {
        if (sortingColumn) {
          sortingColumn.order = null;
        }
        states.sortingColumn = column;
        sortProp = column.property;
      }

      if (!order) {
        sortOrder = column.order = null;
        states.sortingColumn = null;
        sortProp = null;
      } else {
        sortOrder = column.order = order;
      }

      states.sortProp = sortProp;
      states.sortOrder = sortOrder;

      this.store.commit('changeSortCondition');
    }
  },

  data() {
    return {
      draggingColumn: null,
      dragging: false,
      dragState: {},
      dragStart: 0,
      dragEnd: 0
    };
  }
};
