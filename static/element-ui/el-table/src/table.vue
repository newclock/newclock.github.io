<template>
    <div
        class="el-table"
        :class="[{
      'el-table--fit': fit,
      'el-table--striped': stripe,
      'el-table--border': border || isGroup,
      'el-table--hidden': isHidden,
      'el-table--group': isGroup,
      'el-table--fluid-height': maxHeight,
      'el-table--scrollable-x': layout.scrollX,
      'el-table--scrollable-y': layout.scrollY,
      'el-table--enable-row-hover': !store.states.isComplex,
      'el-table--enable-row-transition': (store.states.data || []).length !== 0 && (store.states.data || []).length < 100
    }, tableSize ? `el-table--${ tableSize }` : '']"
        @mouseleave="handleMouseLeave($event)"
    >
        <div class="hidden-columns" ref="hiddenColumns">
            <slot></slot>
        </div>
        <div
            v-if="showHeader"
            v-mousewheel="handleHeaderFooterMousewheel"
            class="el-table__header-wrapper"
            ref="headerWrapper"
        >
            <table-header
                ref="tableHeader"
                :icorePanelShown="icorePanelShown"
                :recordShow="recordShow"
                @showIndvDialog="showIndvDialog"
                :icoreFilterFlag="icoreFilterFlag"
                :exchangeFilterMap="exchangeFilterMap"
                :store="store"
                :dragColumn="dragColumn"
                :individualColumns="individualColumns"
                :checkedColumns="checkedColumnsConfirm"
                :individualInfo="individualInfo"
                :border="border"
                :default-sort="defaultSort"
                :style="{
          width: layout.bodyWidth ? layout.bodyWidth + 'px' : ''
        }"
            ></table-header>
        </div>
        <div
            class="el-table__body-wrapper"
            ref="bodyWrapper"
            :class="[layout.scrollX ? `is-scrolling-${scrollPosition}` : 'is-scrolling-none']"
            :style="[bodyHeight, showSummary ? {'z-index': 2} : '']"
        >
            <table-body
                :recordScrollTop="recordScrollTop"
                :bigDataShow="bigDataShow"
                :recordShow="recordShow"
                :dragRow="dragRow"
                :context="context"
                :store="store"
                :stripe="stripe"
                :row-class-name="rowClassName"
                :row-style="rowStyle"
                :highlight="highlightCurrentRow"
                :style="{
           width: bodyWidth
        }"
            ></table-body>
            <div
                v-if="!data || data.length === 0"
                class="el-table__empty-block"
                ref="emptyBlock"
                :style="{
          width: bodyWidth
        }"
            >
                <span class="el-table__empty-text">
                    <slot name="empty">{{ emptyText || t('el.table.emptyText') }}</slot>
                </span>
            </div>
            <div v-if="$slots.append" class="el-table__append-wrapper" ref="appendWrapper">
                <slot name="append"></slot>
            </div>
        </div>
        <div
            v-if="showSummary"
            v-show="data && data.length > 0"
            v-mousewheel="handleHeaderFooterMousewheel"
            class="el-table__footer-wrapper"
            ref="footerWrapper"
        >
            <table-footer
                :store="store"
                :border="border"
                :sum-text="sumText || t('el.table.sumText')"
                :summary-method="summaryMethod"
                :default-sort="defaultSort"
                :style="{
          width: layout.bodyWidth ? layout.bodyWidth + 'px' : ''
        }"
            ></table-footer>
        </div>
        <div
            v-if="fixedColumns.length > 0"
            v-mousewheel="handleFixedMousewheel"
            class="el-table__fixed"
            ref="fixedWrapper"
            :style="[{
        width: layout.fixedWidth ? layout.fixedWidth + 'px' : ''
      },
      fixedHeight]"
        >
            <div v-if="showHeader" class="el-table__fixed-header-wrapper" ref="fixedHeaderWrapper">
                <table-header
                    ref="fixedTableHeader"
                    fixed="left"
                    :icorePanelShown="icorePanelShown"
                    :recordShow="recordShow"
                    @showIndvDialog="showIndvDialog"
                    :icoreFilterFlag="icoreFilterFlag"
                    :exchangeFilterMap="exchangeFilterMap"
                    :border="border"
                    :dragColumn="dragColumn"
                    :individualColumns="individualColumns"
                    :checkedColumns="checkedColumnsConfirm"
                    :individualInfo="individualInfo"
                    :store="store"
                    :style="{
            width: bodyWidth
          }"
                ></table-header>
            </div>
            <div
                class="el-table__fixed-body-wrapper"
                ref="fixedBodyWrapper"
                :style="[{
          top: layout.headerHeight + 'px'
        },
        fixedBodyHeight]"
            >
                <table-body
                    :recordScrollTop="recordScrollTop"
                    :bigDataShow="bigDataShow"
                    :recordShow="recordShow"
                    fixed="left"
                    :dragRow="dragRow"
                    :store="store"
                    :stripe="stripe"
                    :highlight="highlightCurrentRow"
                    :row-class-name="rowClassName"
                    :row-style="rowStyle"
                    :style="{
            width: bodyWidth
          }"
                ></table-body>
                <div
                    v-if="$slots.append"
                    class="el-table__append-gutter"
                    :style="{
            height: layout.appendHeight + 'px'
          }"
                ></div>
            </div>
            <div
                v-if="showSummary"
                v-show="data && data.length > 0"
                class="el-table__fixed-footer-wrapper"
                ref="fixedFooterWrapper"
            >
                <table-footer
                    fixed="left"
                    :border="border"
                    :sum-text="sumText || t('el.table.sumText')"
                    :summary-method="summaryMethod"
                    :store="store"
                    :style="{
            width: bodyWidth
          }"
                ></table-footer>
            </div>
        </div>
        <div
            v-if="rightFixedColumns.length > 0"
            v-mousewheel="handleFixedMousewheel"
            class="el-table__fixed-right"
            ref="rightFixedWrapper"
            :style="[{
        width: layout.rightFixedWidth ? layout.rightFixedWidth + 'px' : '',
        right: layout.scrollY ? (border ? layout.gutterWidth : (layout.gutterWidth || 0)) + 'px' : ''
      },
      fixedHeight]"
        >
            <div
                v-if="showHeader"
                class="el-table__fixed-header-wrapper"
                ref="rightFixedHeaderWrapper"
            >
                <table-header
                    ref="rightFixedTableHeader"
                    fixed="right"
                    :icorePanelShown="icorePanelShown"
                    :recordShow="recordShow"
                    @showIndvDialog="showIndvDialog"
                    :icoreFilterFlag="icoreFilterFlag"
                    :exchangeFilterMap="exchangeFilterMap"
                    :border="border"
                    :store="store"
                    :dragColumn="dragColumn"
                    :individualColumns="individualColumns"
                    :checkedColumns="checkedColumnsConfirm"
                    :individualInfo="individualInfo"
                    :style="{
            width: bodyWidth
          }"
                ></table-header>
            </div>
            <div
                class="el-table__fixed-body-wrapper"
                ref="rightFixedBodyWrapper"
                :style="[{
          top: layout.headerHeight + 'px'
        },
        fixedBodyHeight]"
            >
                <table-body
                    :recordScrollTop="recordScrollTop"
                    :bigDataShow="bigDataShow"
                    :recordShow="recordShow"
                    fixed="right"
                    :dragRow="dragRow"
                    :store="store"
                    :stripe="stripe"
                    :row-class-name="rowClassName"
                    :row-style="rowStyle"
                    :highlight="highlightCurrentRow"
                    :style="{
            width: bodyWidth
          }"
                ></table-body>
            </div>
            <div
                v-if="showSummary"
                v-show="data && data.length > 0"
                class="el-table__fixed-footer-wrapper"
                ref="rightFixedFooterWrapper"
            >
                <table-footer
                    fixed="right"
                    :border="border"
                    :sum-text="sumText || t('el.table.sumText')"
                    :summary-method="summaryMethod"
                    :store="store"
                    :style="{
            width: bodyWidth
          }"
                ></table-footer>
            </div>
        </div>
        <div
            v-if="rightFixedColumns.length > 0"
            class="el-table__fixed-right-patch"
            ref="rightFixedPatch"
            :style="{
        width: layout.scrollY ? layout.gutterWidth + 'px' : '0',
        height: layout.headerHeight + 'px'
      }"
        ></div>
        <div class="el-table__column-resize-proxy" ref="resizeProxy" v-show="resizeProxyVisible"></div>
        <el-dialog
            ref="individualDialog"
            class="el-table-dialog"
            v-if="individualColumns"
            title="个性化设置"
            width="900px"
            :visible.sync="dialogVisible"
        >
            <div
                style="min-height:100px;width:200px;display:inline-block;border-right:1px solid #ddd;max-height:500px;overflow: auto;"
            >
                <div>表格原始信息</div>
                <div style="width:100px;">
                    <el-checkbox
                        style="margin-left:0px;margin-right:30px;"
                        :indeterminate="isIndeterminate"
                        v-model="checkAll"
                        @change="handleCheckAllChange"
                    >全选</el-checkbox>
                    <div style="margin: 15px 0;"></div>
                    <el-checkbox-group
                        v-model="checkedColumns"
                        @change="handleCheckedColumnsChange"
                    >
                        <el-checkbox
                            style="margin-left:0px;margin-right:30px;"
                            v-for="column in recordColumns"
                            :label="column"
                            :key="column"
                        >{{column ? column : '选择'}}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>
            <div style="min-height:100px;width:calc(100% - 220px);float:right;">
                <div>表格个性化信息</div>
                <div style="overflow:scroll">
                    <table class="el-table el-table--border">
                        <thead>
                            <tr>
                                <th
                                    @dragstart="tableDragSet($event, column)"
                                    @drop="tableDragDrop($event, column)"
                                    @dragover="tableDragAllowDrop($event)"
                                    :draggable="true"
                                    style="cursor:pointer;min-width:100px;"
                                    v-for="column in checkedColumns"
                                    :label="column"
                                    :key="column"
                                >{{column ? column : '选择'}}</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRecord">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog
            ref="icoreFilterDialog"
            v-if="icoreFilterFlag"
            :title="dialogVisibleTitle"
            :visible.sync="dialogVisibleSet"
            width="600px"
        >
            <div>
                <div
                    style="width:100%;height:60px;border-bottom:1px solid #ddd;display:inline-block;overflow: hidden;"
                >
                    <el-button
                        size="mini"
                        style="margin-top:10px;"
                        @click="addRule"
                        type="primary"
                    >添加条件</el-button>
                    <el-button
                        size="mini"
                        style="margin-top:10px;margin-left: 0px;"
                        :disabled="disableColumn"
                        @click="deleteRule"
                        type="primary"
                    >删除条件</el-button>
                    <el-button
                        size="mini"
                        style="margin-top:10px;margin-left: 0px;"
                        :disabled="columRuleData.length === 0"
                        @click="columRuleData.splice(0, columRuleData.length)"
                        type="primary"
                    >清空条件</el-button>
                </div>
                <div style="width:100%;height:300px;display:inline-block;overflow:auto;">
                    <el-table
                        @row-click="columRuleRowClick"
                        height="300"
                        highlight-current-row
                        :data="columRuleData"
                        stripe
                        style="width: 100%"
                    >
                        <el-table-column label="序号" width="50">
                            <template slot-scope="scope">{{scope.$index + 1}}</template>
                        </el-table-column>
                        <el-table-column label="条件" width="120">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.linkRule" placeholder="请选择">
                                    <el-option
                                        v-for="item in [{label: '并且', value: '1'}, {label: '或者', value: '2'}]"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="比较运算符" width="120">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.rule" placeholder="请选择">
                                    <el-option
                                        v-for="item in columRuleOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="准则">
                            <template slot-scope="scope">
                                <el-select
                                    v-model="scope.row.value"
                                    allow-create
                                    default-first-option
                                    filterable
                                    placeholder="请选择"
                                >
                                    <el-option
                                        v-for="item in columValueOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisibleSet = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisibleSetEvent">确 定</el-button>
            </span>
        </el-dialog>
        <div ref="icoreFilterLoading" class="el-loading-mask" style="display:none;">
            <div class="el-loading-spinner">
                <svg viewBox="25 25 50 50" class="circular">
                    <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
                </svg>
                <p class="el-loading-text">正在整理数据</p>
            </div>
        </div>
        <div
            class="icore-individual-panel"
            v-if="individualPanel"
            :style="icorePanelShownEdit ? '' :{
            height: layout.headerHeight + 'px'
         }"
            @click="icorePanelShownEdit = !icorePanelShownEdit"
        >
            <div style="margin-top:10px">|||</div>
        </div>
        <div
            class="icore-individual-panel-shown"
            v-if="individualPanel"
            v-show="icorePanelShownEdit"
        >
            <div class="icore-individual-panel-shown-tree-area">
                <div class="icore-individual-panel-tree-set-area">
                    <div class="icore-individual-panel-shown-title">个性化设置</div>
                    <el-tree
                        draggable
                        ref="individualTree"
                        style="background:#F9FBF8;"
                        :data="recordColumnsTree"
                        show-checkbox
                        node-key="is"
                        @check="individualhandleCheckChange"
                        :default-checked-keys="iDefaultCheckedKeys"
                        @node-drop="individualDrop"
                        :allow-drop="allowDrop"
                    ></el-tree>
                </div>
                <el-button
                    type="primary"
                    size="mini"
                    @click="setIdvEvent(true)"
                    class="icore-individual-panel-shown-button-area"
                >保存</el-button>
            </div>
            <div class="icore-individual-panel-shown-group-area">
                <div class="icore-individual-panel-shown-title">分组查看</div>
                <el-select
                    v-model="groupValue"
                    size="mini"
                    clearable
                    filterable
                    placeholder="请选择"
                    @change="changeGroup"
                >
                    <el-option
                        v-for="item in groupColumns"
                        :key="item.id"
                        :label="item.label"
                        :value="item.id"
                    ></el-option>
                </el-select>
            </div>
            <div class="icore-individual-panel-shown-group-area">
                <div class="icore-individual-panel-shown-title">统　　计</div>
                <el-select
                    v-model="totalValue"
                    size="mini"
                    clearable
                    filterable
                    placeholder="请选择"
                    @change="getStatistical"
                >
                    <el-option
                        v-for="item in totalGroup"
                        :key="item.id"
                        :label="item.label"
                        :value="item.id"
                    ></el-option>
                </el-select>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
import ElDialog from "element-ui/packages/dialog";
import ElCheckbox from "element-ui/packages/checkbox";
import debounce from "throttle-debounce/debounce";
import {
    addResizeListener,
    removeResizeListener
} from "element-ui/src/utils/resize-event";
import Mousewheel from "element-ui/src/directives/mousewheel";
import Locale from "element-ui/src/mixins/locale";
import Migrating from "element-ui/src/mixins/migrating";
import TableStore from "./table-store";
import TableLayout from "./table-layout";
import TableBody from "./table-body";
import TableHeader from "./table-header";
import TableFooter from "./table-footer";

let tableIdSeed = 1;
let clone = require("clone");

export default {
    name: "ElTable",

    mixins: [Locale, Migrating],

    directives: {
        Mousewheel
    },
    props: {
        data: {
            type: Array,
            default: function() {
                return [];
            }
        },

        size: String,

        width: [String, Number],

        height: [String, Number],

        maxHeight: [String, Number],

        fit: {
            type: Boolean,
            default: true
        },

        stripe: {
            type: Boolean,
            default: false
        },

        border: Boolean,

        dragColumn: [String, Boolean],

        individualColumns: [String, Boolean],

        individualInfo: [Object],

        individualPanelInfo: [Object],

        dragRow: [String, Boolean],

        icoreFilterFlag: {
            type: Boolean,
            default: false
        },

        exchangeFilterMap: {
            type: Object,
            default: function() {
                return {};
            }
        },

        rowKey: [String, Function],

        context: {},

        showHeader: {
            type: Boolean,
            default: true
        },

        showSummary: Boolean,

        sumText: String,

        summaryMethod: Function,

        rowClassName: [String, Function],

        rowStyle: [Object, Function],

        cellClassName: [String, Function],

        cellStyle: [Object, Function],

        headerRowClassName: [String, Function],

        headerRowStyle: [Object, Function],

        headerCellClassName: [String, Function],

        headerCellStyle: [Object, Function],

        highlightCurrentRow: Boolean,

        currentRowKey: [String, Number],

        emptyText: String,

        expandRowKeys: Array,

        defaultExpandAll: Boolean,

        defaultSort: Object,

        tooltipEffect: String,

        spanMethod: Function,

        selectOnIndeterminate: {
            type: Boolean,
            default: true
        },
        bigDataShow: {
            type: Array,
            default: function() {
                return [];
            }
        },
        icorePanelShown: {
            type: Number,
            default: 50
        },
        individualPanel: {
            type: Boolean,
            default: false
        }
    },

    components: {
        TableHeader,
        TableFooter,
        TableBody,
        ElCheckbox
    },

    methods: {
        setGp() {
            let tempGroup = [];
            let totalTemp = [];
            for (let i = 0; i < this.store.states.columns.length; i++) {
                if (
                    this.store.states.columns[i].type === "default" ||
                    this.store.states.columns[i].type === "noFilter"
                ) {
                    tempGroup.push({
                        id: this.store.states.columns[i].property,
                        label: this.store.states.columns[i].label
                    });
                }
                if (this.store.states.columns[i].statistical) {
                    totalTemp.push({
                        id: this.store.states.columns[i].property,
                        label: this.store.states.columns[i].label
                    });
                }
            }
            this.groupColumns = tempGroup;
            this.totalGroup = totalTemp;
        },
        setIdvPanel() {
            let temp = this.store.states.initColumns;
            this.store.commit("changeTempii", temp);
            this.store.states.individualColumnsTree = temp;
            this.recordColumnsTree = clone(temp);
        },
        allowDrop(draggingNode, dropNode, type) {
            return dropNode.level === draggingNode.level && type !== "inner";
        },
        individualDrop() {
            let that = this;
            that.$refs.individualTree.setCheckedKeys(that.checkedIndividualArr);
            //   that.iDefaultCheckedKeys = ;
        },
        individualhandleCheckChange(arg1, arg2, arg3) {
            let that = this;
            that.checkedIndividualArr = arg2.checkedKeys;
            that.setlectIndividualArr = arg2.checkedKeys.concat(
                arg2.halfCheckedKeys
            );
        },
        deleteOthers (getV) {
            let that = this;
            let temp = clone(getV);
            let changeTempii = function(stemp) {
                for (let i = 0; i < stemp.length; i++) {
                    for (let m in stemp[i]) {
                        if (m !== 'children' && m !== 'ii' && m !== 'is') {
                            delete stemp[i][m];
                        }
                    }
                    if (stemp[i].children) {
                        changeTempii(stemp[i].children);
                    }
                }
            }
            changeTempii(temp);
            return temp;
        },
        setIdvEvent(flag) {
            let that = this;
            that.store.states.individualColumnsTree = clone(
                that.recordColumnsTree
            );
            that.changeTempShown(that.store.states.individualColumnsTree);
            that.store.states.initColumns = clone(
                that.store.states.individualColumnsTree
            );
            that.store.states._columns = that.store.states.initColumns;
            if (flag) {
                that.$emit("setIdv", {
                    recordColumnsTree: that.deleteOthers(that.recordColumnsTree),
                    checkedIndividualArr: that.checkedIndividualArr,
                    setlectIndividualArr: that.setlectIndividualArr
                });
            }
            //   that.store.states.initColumns = that.store.states._columns;
            if (this.store.table.$ready) {
                this.store.updateColumns(); // hack for dynamics insert column
                this.store.scheduleLayout();
                this.$nextTick(() => {
                    this.setGp();
                });
            }
        },
        changeTempShown(temp) {
            let that = this;
            for (let i = 0; i < temp.length; i++) {
                if (!that.setlectIndividualArr.includes(temp[i].is)) {
                    temp.splice(i, 1);
                    --i;
                } else {
                    if (temp[i].children) {
                        that.changeTempShown(temp[i].children);
                    }
                }
            }
        },
        clearIcoreTableFilter() {
            let that = this;
            let temp = [];
            for (let i = 0; i < that.store.states._data.length; i++) {
                temp.push(that.store.states._data[i]);
            }
            that.store.states.filterMapper = {};
            that.store.states.filterIndividualMap = {};
            that.store.states.data = temp;
            for (let i = 0; i < 200; i++) {
                that.store.states["columnFilterValArr" + i] = [];
                that.store.states["columnFilterVal" + i] = "";
                that.store.states["columnCommand" + i] = "=";
                that.store.states["columnIndividual" + i] = [];
            }
        },
        tableDragSet(event, column) {
            let that = this;
            let returnFlag = false;
            for (let i = 0; i < that.recordColumnsEn.length; i++) {
                let columnComp = that.recordColumnsEn[i].label
                    ? that.recordColumnsEn[i].label
                    : "";
                if (column === columnComp && that.recordColumnsEn[i].fixed) {
                    returnFlag = true;
                    break;
                }
            }

            if (returnFlag) {
                event.preventDefault();
                return;
            }
            that.tableDragSetStart = column;
        },
        tableDragDrop(event, column) {
            let that = this;
            let returnFlag = false;
            for (let i = 0; i < that.recordColumnsEn.length; i++) {
                let columnComp = that.recordColumnsEn[i].label
                    ? that.recordColumnsEn[i].label
                    : "";
                if (column === columnComp && that.recordColumnsEn[i].fixed) {
                    returnFlag = true;
                    break;
                }
            }
            if (returnFlag) {
                event.preventDefault();
                return;
            }
            if (column !== that.tableDragSetStart) {
                let temp = [];
                for (let i = 0; i < that.checkedColumns.length; i++) {
                    if (that.checkedColumns[i] === that.tableDragSetStart) {
                        continue;
                    }
                    if (that.checkedColumns[i] === column) {
                        temp.push(that.tableDragSetStart);
                    }
                    temp.push(that.checkedColumns[i]);
                }
                that.checkedColumns = temp;
            }
            event.preventDefault();
        },
        tableDragAllowDrop(event) {
            let that = this;
            event.preventDefault();
        },
        dialogVisibleSetEvent() {
            let that = this;
            var temp = [];
            that.dialogVisibleSet = false;
            setTimeout(() => {
                for (let i = 0; i < that.columRuleData.length; i++) {
                    if (
                        that.columRuleData[i].rule !== "" &&
                        that.columRuleData[i].value !== ""
                    ) {
                        temp.push(that.columRuleData[i]);
                    }
                }
                that.store.states[
                    "columnIndividual" + that.tableBodyCellIndex
                ] = temp;
                if (temp.length === 0) {
                    delete that.store.states.filterIndividualMap[
                        that.tableBodyCellIndex
                    ];
                } else {
                    that.store.states.filterIndividualMap[
                        that.tableBodyCellIndex
                    ] = [that.tableBodyColumn.property, { val: temp }];
                }
                that.tableBodyVue.icoreFilterMethod(
                    that.tableBodyColumn,
                    that.tableBodyCellIndex
                );
            }, 200);

            // that.$nextTick(() => {

            // });
        },
        deleteRule() {
            let that = this;
            that.columRuleData.splice(that.columRuleCurrentIndex, 1);
            that.disableColumn = true;
        },
        addRule() {
            let that = this;
            that.columRuleData.push({
                rule: "",
                value: "",
                linkRule: that.dialogVisibleRadio
            });
        },
        columRuleRowClick(row, event, column) {
            let that = this;
            that.columRuleCurrentIndex =
                parseInt(
                    event.target.parentElement.parentElement.getElementsByTagName(
                        "td"
                    )[0].innerText
                ) - 1;
            that.disableColumn = false;
        },
        showIndvDialog(args) {
            let that = this;
            let data = args.data;
            let column = args.column;
            let cellIndex = args.cellIndex;
            that.tableBodyColumn = args.column;
            that.tableBodyCellIndex = args.cellIndex;
            that.tableBodyVue = args.vue;
            let exchangeFilterMap = that.exchangeFilterMap;
            let filterSet = [
                {
                    label: "空",
                    value: ""
                }
            ];
            if (that.bigDataShow.length > 1 && !column.shownFilterPanel) {
                filterSet = [];
                if (exchangeFilterMap[column.property]) {
                    for (let i in exchangeFilterMap[column.property]) {
                        filterSet.push({
                            label: exchangeFilterMap[column.property][i],
                            value: i
                        });
                    }
                }
            } else {
                let obj = {};
                let filterTemp = [];
                for (let i of data) {
                    if (
                        i[column.property] === null ||
                        i[column.property] === "" ||
                        typeof i[column.property] === "undefined"
                    ) {
                        continue;
                    }
                    if (!obj[i[column.property]]) {
                        filterTemp.push({
                            label: exchangeFilterMap[column.property]
                                ? exchangeFilterMap[column.property][
                                      i[column.property]
                                  ]
                                : i[column.property],
                            value: i[column.property]
                        });
                        obj[i[column.property]] = 1;
                    }
                }
                filterSet = [
                    {
                        label: "空",
                        value: ""
                    }
                ].concat(filterTemp);
            }
            let tempArr = [];
            for (
                let i = 0;
                i < that.store.states["columnIndividual" + cellIndex].length;
                i++
            ) {
                tempArr.push(
                    that.store.states["columnIndividual" + cellIndex][i]
                );
            }
            if (tempArr.length === 0) {
                that.columRuleData = [
                    {
                        rule: "",
                        value: "",
                        linkRule: that.dialogVisibleRadio
                    }
                ];
            } else {
                that.columRuleData = tempArr;
            }
            that.columValueOptions = filterSet;
            (that.dialogVisibleTitle = "自定义规则  ----  " + column.label),
                (that.dialogVisibleSet = true);
        },
        setRecord() {
            let that = this;
            if (that.checkedColumns.length === 0) {
                that.$message({
                    type: "error",
                    message: "请至少选择一列"
                });
                return;
            }
            that.$put(
                "sysuseruicfgs",
                {
                    userId: that.individualInfo.userId,
                    userCode: that.individualInfo.userCode,
                    uiId: that.individualInfo.uiId,
                    cfgInfo: JSON.stringify({
                        [that.individualColumns]: that.checkedColumns,
                        [that.dragColumn]: that.checkedColumns
                    })
                },
                "",
                that.individualInfo.cfgId
            )
                .then(function(response) {
                    if (response.data.succeed) {
                        that.$parent.individualInfo = response.data.data;
                        that.checkedColumnsConfirm = that.checkedColumns;
                        that.dialogVisible = false;
                    } else {
                        that.$message({
                            type: "error",
                            message: response.data.resultMessage
                        });
                    }
                })
                .catch(function(error) {
                    console.error(error);
                });
        },
        handleCheckAllChange(val) {
            this.checkedColumns = val ? this.recordColumns : [];
            this.isIndeterminate = false;
        },
        handleCheckedColumnsChange(value) {
            let checkedCount = value.length;
            this.checkAll = checkedCount === this.recordColumns.length;
            this.isIndeterminate =
                checkedCount > 0 && checkedCount < this.recordColumns.length;
        },
        getMigratingConfig() {
            return {
                events: {
                    expand: "expand is renamed to expand-change"
                }
            };
        },

        setCurrentRow(row) {
            this.store.commit("setCurrentRow", row);
        },

        toggleRowSelection(row, selected) {
            this.store.toggleRowSelection(row, selected);
            this.store.updateAllSelected();
        },

        toggleRowExpansion(row, expanded) {
            this.store.toggleRowExpansion(row, expanded);
        },

        clearSelection() {
            this.store.clearSelection();
        },

        clearFilter() {
            this.store.clearFilter();
        },

        clearSort() {
            this.store.clearSort();
        },

        handleMouseLeave() {
            this.store.commit("setHoverRow", null);
            if (this.hoverState) this.hoverState = null;
        },

        updateScrollY() {
            this.layout.updateScrollY();
            this.layout.updateColumnsWidth();
        },

        handleFixedMousewheel(event, data) {
            const bodyWrapper = this.bodyWrapper;
            if (Math.abs(data.spinY) > 0) {
                const currentScrollTop = bodyWrapper.scrollTop;
                if (data.pixelY < 0 && currentScrollTop !== 0) {
                    event.preventDefault();
                }
                if (
                    data.pixelY > 0 &&
                    bodyWrapper.scrollHeight - bodyWrapper.clientHeight >
                        currentScrollTop
                ) {
                    event.preventDefault();
                }
                bodyWrapper.scrollTop += Math.ceil(data.pixelY / 5);
            } else {
                bodyWrapper.scrollLeft += Math.ceil(data.pixelX / 5);
            }
        },

        handleHeaderFooterMousewheel(event, data) {
            const { pixelX, pixelY } = data;
            if (Math.abs(pixelX) >= Math.abs(pixelY)) {
                event.preventDefault();
                this.bodyWrapper.scrollLeft += data.pixelX / 5;
            }
        },

        bindEvents() {
            const { headerWrapper, footerWrapper } = this.$refs;
            const refs = this.$refs;
            let self = this;

            this.bodyWrapper.addEventListener("scroll", function(e) {
                if (headerWrapper) headerWrapper.scrollLeft = this.scrollLeft;
                if (footerWrapper) footerWrapper.scrollLeft = this.scrollLeft;
                if (refs.fixedBodyWrapper)
                    refs.fixedBodyWrapper.scrollTop = this.scrollTop;
                if (refs.rightFixedBodyWrapper)
                    refs.rightFixedBodyWrapper.scrollTop = this.scrollTop;
                const maxScrollLeftPosition =
                    this.scrollWidth - this.offsetWidth - 1;
                const scrollLeft = this.scrollLeft;
                if (scrollLeft >= maxScrollLeftPosition) {
                    self.scrollPosition = "right";
                } else if (scrollLeft === 0) {
                    self.scrollPosition = "left";
                } else {
                    self.scrollPosition = "middle";
                }
                self.recordScrollArr.unshift(this.scrollTop);
                self.recordScrollArr.splice(2, 1);
                if (self.bigDataShow.length > 1) {
                    if (self.$el.getElementsByClassName("el-table__row")[0]) {
                        let realRect = self.$el.getElementsByClassName("el-table__row")[0]
                            .getBoundingClientRect();
                        let realHeight = realRect.bottom - realRect.top;
                        if (self.bigDataShow[1] !== realHeight) {
                            self.bigDataShow[1] = realHeight;
                            self.recordShow[2] = self.bigDataShow[1];
                        }
                    }
                    self.recordScrollTop = this.scrollTop;
                    if (
                        Math.abs(
                            self.recordScrollArr[1] - self.recordScrollArr[0]
                        ) > 200
                    ) {
                        if (!self.recordInterval) {
                            self.recordInterval = setInterval(() => {
                                if (
                                    self.bodyWrapper.scrollTop ===
                                    self.recordScrollArr[0]
                                ) {
                                    self.scrollFlag = true;
                                    self.recordScrollTop =
                                        self.bodyWrapper.scrollTop - 1;
                                    clearInterval(self.recordInterval);
                                    self.recordInterval = null;
                                }
                            }, 666);
                        }
                    } else {
                        self.scrollFlag = true;
                    }
                }
            });

            if (this.fit) {
                addResizeListener(this.$el, this.resizeListener);
            }
        },

        resizeListener() {
            if (!this.$ready) return;
            let shouldUpdateLayout = false;
            const el = this.$el;
            const { width: oldWidth, height: oldHeight } = this.resizeState;

            const width = el.offsetWidth;
            if (oldWidth !== width) {
                shouldUpdateLayout = true;
            }

            const height = el.offsetHeight;
            if (
                (this.height || this.shouldUpdateHeight) &&
                oldHeight !== height
            ) {
                shouldUpdateLayout = true;
            }

            if (shouldUpdateLayout) {
                this.resizeState.width = width;
                this.resizeState.height = height;
                this.doLayout();
            }
        },

        doLayout() {
            this.layout.updateColumnsWidth();
            if (this.shouldUpdateHeight) {
                this.layout.updateElsHeight();
            }
        },

        sort(prop, order) {
            this.store.commit("sort", { prop, order });
        },
        changeGroup(val) {
            this.store.commit("changeGroup", val);
        },
        getStatistical(val) {
            this.store.commit("getStatistical", val);
        }
    },

    created() {
        this.tableId = "el-table_" + tableIdSeed++;
        this.debouncedUpdateLayout = debounce(50, () => this.doLayout());
        if (this.bigDataShow.length > 1) {
            this.recordShow = [
                0,
                (this.bigDataShow[0] * 3) / 2,
                this.bigDataShow[1]
            ];
        } else {
            this.recordShow = [0].concat(this.bigDataShow);
        }
    },

    computed: {
        tableSize() {
            return this.size || (this.$ELEMENT || {}).size;
        },

        bodyWrapper() {
            return this.$refs.bodyWrapper;
        },

        shouldUpdateHeight() {
            return (
                this.height ||
                this.maxHeight ||
                this.fixedColumns.length > 0 ||
                this.rightFixedColumns.length > 0
            );
        },

        selection() {
            return this.store.states.selection;
        },

        columns() {
            return this.store.states.columns;
        },

        tableData() {
            return this.store.states.data;
        },

        fixedColumns() {
            return this.store.states.fixedColumns;
        },

        rightFixedColumns() {
            return this.store.states.rightFixedColumns;
        },

        bodyWidth() {
            const { bodyWidth, scrollY, gutterWidth } = this.layout;
            return bodyWidth
                ? bodyWidth - (scrollY ? gutterWidth : 0) + "px"
                : "";
        },

        bodyHeight() {
            if (this.height) {
                return {
                    height: this.layout.bodyHeight
                        ? this.layout.bodyHeight + "px"
                        : ""
                };
            } else if (this.maxHeight) {
                return {
                    "max-height":
                        (this.showHeader
                            ? this.maxHeight -
                              this.layout.headerHeight -
                              this.layout.footerHeight
                            : this.maxHeight - this.layout.footerHeight) + "px"
                };
            }
            return {};
        },

        fixedBodyHeight() {
            if (this.height) {
                return {
                    height: this.layout.fixedBodyHeight
                        ? this.layout.fixedBodyHeight + "px"
                        : ""
                };
            } else if (this.maxHeight) {
                let maxHeight = this.layout.scrollX
                    ? this.maxHeight - this.layout.gutterWidth
                    : this.maxHeight;

                if (this.showHeader) {
                    maxHeight -= this.layout.headerHeight;
                }

                maxHeight -= this.layout.footerHeight;

                return {
                    "max-height": maxHeight + "px"
                };
            }

            return {};
        },

        fixedHeight() {
            if (this.maxHeight) {
                if (this.showSummary) {
                    return {
                        bottom: 0
                    };
                }
                return {
                    bottom:
                        this.layout.scrollX && this.data.length
                            ? this.layout.gutterWidth + "px"
                            : ""
                };
            } else {
                if (this.showSummary) {
                    return {
                        height: this.layout.tableHeight
                            ? this.layout.tableHeight + "px"
                            : ""
                    };
                }
                return {
                    height: this.layout.viewportHeight
                        ? this.layout.viewportHeight + "px"
                        : ""
                };
            }
        }
    },

    watch: {
        individualPanelInfo(n) {
            let that = this;
            try {

                /**
                 * 设置处理信息
                 * */
                let arrsort = [];
                let changeTempii = function(temp, setArr) {
                    for (let i = 0; i < temp.length; i++) {
                        let ms = (setArr || []).concat([i]);
                        arrsort.push(ms);
                        if (temp[i].children) {
                            changeTempii(temp[i].children, ms.concat(['children']));
                        }
                    }
                }

                let getIndex = function (getV) {
                    let valIndex = '';
                    for (let k = 0; k < getV.length; k++) {
                        let gg;
                        if (typeof (getV[k]) === 'number') {
                            gg = getV[k];
                        } else {
                            gg = `'${getV[k]}'`
                        }
                        valIndex = valIndex + `[${gg}]`;
                    }
                    return valIndex;
                }

                changeTempii(that.individualPanelInfo.recordColumnsTree);

                let temp = clone(that.individualPanelInfo.recordColumnsTree);

                for (let i = 0; i < arrsort.length; i++) {
                    let valIndex = getIndex(arrsort[i]);
                    let tempVal = eval(`that.individualPanelInfo.recordColumnsTree${valIndex}`);
                    eval(`temp${valIndex} = clone(that.recordColumnsTree${getIndex(tempVal.ii)})`);
                }

                that.recordColumnsTree = clone(temp);
                that.$nextTick(() => {
                    that.$refs.individualTree.setCheckedKeys(that.individualPanelInfo.checkedIndividualArr, true);
                    that.setlectIndividualArr = clone(that.individualPanelInfo.setlectIndividualArr);
                    that.setIdvEvent(false);
                });
            } catch (err) {
                // TODO
            }
            
        },
        icorePanelShownEdit(n) {
            if (n) {
                this.setGp();
            }
            // TODO
        },
        dialogVisible(n) {
            let that = this;
            if (n) {
                if (that.$refs["individualDialog"]) {
                    that.$parent.$el.appendChild(
                        that.$refs["individualDialog"].$el
                    );
                }
                if (typeof that.individualColumns === "string") {
                    if (
                        JSON.parse(that.individualInfo.cfgInfo)[
                            that.individualColumns
                        ]
                    ) {
                        that.checkedColumns = JSON.parse(
                            that.individualInfo.cfgInfo
                        )[that.individualColumns];
                    } else {
                        that.checkedColumns = that.recordColumns;
                    }
                    if (
                        that.checkedColumns.length === that.recordColumns.length
                    ) {
                        that.checkAll = true;
                        that.isIndeterminate = false;
                    } else {
                        that.checkAll = false;
                        that.isIndeterminate = true;
                    }
                }
            }
        },
        dialogVisibleSet(n) {
            let that = this;
            if (n) {
                if (that.$refs["icoreFilterDialog"]) {
                    that.$parent.$el.appendChild(
                        that.$refs["icoreFilterDialog"].$el
                    );
                }
            }
        },
        height: {
            immediate: true,
            handler(value) {
                this.layout.setHeight(value);
            }
        },

        maxHeight: {
            immediate: true,
            handler(value) {
                this.layout.setMaxHeight(value);
            }
        },

        currentRowKey(newVal) {
            this.store.setCurrentRowKey(newVal);
        },

        data: {
            immediate: true,
            handler(value) {
                this.store.commit("setData", value);
                if (this.$ready) {
                    this.$nextTick(() => {
                        this.doLayout();
                        if (this.icoreFilterFlag) {
                            this.store.commit("icoreFilterSet");
                        }
                    });
                }
            }
        },

        expandRowKeys: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.store.setExpandRowKeys(newVal);
                }
            }
        }
    },

    destroyed() {
        if (this.resizeListener)
            removeResizeListener(this.$el, this.resizeListener);
    },

    mounted() {
        this.bindEvents();
        this.store.updateColumns();
        this.doLayout();

        this.resizeState = {
            width: this.$el.offsetWidth,
            height: this.$el.offsetHeight
        };

        if (this.individualPanel && this.store.states.individualColumnsTree.length === 0) {
            this.setIdvPanel();
        }

        // init filters
        this.store.states.columns.forEach(column => {
            if (column.filteredValue && column.filteredValue.length) {
                this.store.commit("filterChange", {
                    column,
                    values: column.filteredValue,
                    silent: true
                });
            }
        });

        this.$ready = true;
    },

    data() {
        const store = new TableStore(this, {
            rowKey: this.rowKey,
            defaultExpandAll: this.defaultExpandAll,
            selectOnIndeterminate: this.selectOnIndeterminate
        });
        const layout = new TableLayout({
            store,
            table: this,
            fit: this.fit,
            showHeader: this.showHeader
        });
        return {
            layout,
            store,
            isHidden: false,
            dialogVisible: false,
            checkAll: false,
            checkedColumns: [],
            checkedColumnsConfirm: [],
            recordColumns: [],
            recordColumnsEn: [],
            isIndeterminate: false,
            renderExpanded: null,
            resizeProxyVisible: false,
            resizeState: {
                width: null,
                height: null
            },
            // 是否拥有多级表头
            isGroup: false,
            scrollPosition: "left",
            dialogVisibleTitle: "",
            dialogVisibleSet: false,
            dialogVisibleRadio: "1",
            disableColumn: true,
            columRuleData: [],
            columRuleOptions: [
                {
                    label: "= 等于",
                    value: "="
                },
                {
                    label: "≠ 不等于",
                    value: "≠"
                },
                {
                    label: "< 小于",
                    value: "<"
                },
                {
                    label: "≤ 小于等于",
                    value: "≤"
                },
                {
                    label: "> 大于",
                    value: ">"
                },
                {
                    label: "≥ 大于等于",
                    value: "≥"
                },
                {
                    label: "Aa 模糊查找",
                    value: "*"
                }
            ],
            columValueOptions: [],
            columRuleCurrentIndex: 0,
            tableBodyColumn: null,
            tableBodyCellIndex: null,
            tableBodyVue: null,
            tableDragSetStart: "",
            recordScrollTop: 0,
            recordScrollArr: [0],
            recordShow: [],
            scrollFlag: false,
            recordInterval: null,
            icorePanelShownEdit: false,
            setlectIndividualArr: [],
            checkedIndividualArr: [],
            recordColumnsTree: [],
            iDefaultCheckedKeys: [],
            groupColumns: [],
            totalGroup: [],
            groupValue: "",
            totalValue: ""
        };
    }
};
</script>

<style lang="scss">
.el-table-dialog {
    position: fixed;
}
.icore-individual-panel {
    position: absolute;
    height: 100%;
    width: 9px;
    top: 0;
    right: 1px;
    z-index: 999;
    // background-color: #F9FBF8;
    cursor: pointer;
}
.icore-individual-panel-shown {
    position: absolute;
    height: 100%;
    width: 300px;
    top: 0;
    right: 10px;
    z-index: 999;
    background-color: #f9fbf8;
    border-left: 1px solid #dddddd;
    overflow: auto;
}
.icore-individual-panel-shown-tree-area {
    width: 100%;
    height: 50%;
    min-height: 200px;
    overflow: auto;
    padding-top: 10px;
    border-bottom: 1px solid #cccccc;
    position: relative;
}
.icore-individual-panel-shown-group-area {
    width: 100%;
    height: 50px;
    overflow: auto;
    padding-top: 10px;
    border-bottom: 1px solid #cccccc;
    position: relative;
}
.icore-individual-panel-tree-set-area {
    position: relative;
    height: 100%;
    overflow: auto;
}
.icore-individual-panel-shown-button-area {
    position: absolute;
    bottom: 10px;
    right: 20px;
    z-index: 999;
}
.icore-individual-panel-shown-title {
    display: inline;
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
}
</style>

