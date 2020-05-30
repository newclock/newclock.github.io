<template>
  <transition name="el-zoom-in-top">
    <div
      class="el-table-filter"
      v-clickoutside="handleOutsideClick"
      v-show="showPopper">
      <div class="el-table-filter__content">
        <div class="icore-filter-input-area">
            <el-input
            placeholder="请输入内容"
            prefix-icon="el-icon-search"
            @keyup.native="searchFilterEvent"
            v-model="searchFilter">
            </el-input>
        </div>
        <el-scrollbar ref="scrollArea" wrap-class="el-table-filter__wrap">
          <el-checkbox-group class="el-table-filter__checkbox-group" @change="handleCheckedChange" v-model="filteredValue">
            <el-checkbox :id="'sb' + index"
              v-for="(filter, index) in filtersBak.slice(count * icorePanelShown, ((count * icorePanelShown + (icorePanelShown * 2) - filtersBak.length) >= 0) ? (filtersBak.length + 1) : (count * icorePanelShown + icorePanelShown))"
              :key="filter.value"
              :label="filter.value">{{ filter.label }}</el-checkbox>
          </el-checkbox-group>
        </el-scrollbar>
      </div>
      <div class="el-table-filter__bottom">
        <el-checkbox :indeterminate="isIndeterminate"  v-model="checkAll" @change="checkedAllChange">全选</el-checkbox>
        <el-button @click="setFilterEvent">筛选</el-button>
        <el-button @click="filteredValue = [];isIndeterminate = false; checkAll = false; setFilterEvent()">重置</el-button>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
  import Popper from 'element-ui/src/utils/vue-popper';
  import { PopupManager } from 'element-ui/src/utils/popup';
  import Locale from 'element-ui/src/mixins/locale';
  import Clickoutside from 'element-ui/src/utils/clickoutside';
  import Dropdown from './dropdown';
  import ElCheckbox from 'element-ui/packages/checkbox';
  import ElCheckboxGroup from 'element-ui/packages/checkbox-group';

  export default {
    name: 'ElTableFilterPanel',

    mixins: [Popper, Locale],

    directives: {
      Clickoutside
    },

    components: {
      ElCheckbox,
      ElCheckboxGroup
    },

    props: {
      placement: {
        type: String,
        default: 'bottom-end'
      }
    },

    methods: {
      handleCheckedChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.filtersBak.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.filtersBak.length;
      },

      handleOutsideClick() {
        setTimeout(() => {
          this.showPopper = false;
        }, 16);
      },

      searchFilterEvent() {
            let that = this;
            that.count = 0;
            if (that.searchFilter !== '') {
            var temp = that.filterSet.filter(function(val) {
                return (val.value + '').indexOf(that.searchFilter + '') > -1;
            });
            that.filtersBak = temp;
            } else {
            that.filtersBak = that.filterSet;
            }
            that.handleCheckedChange(that.filteredValue);
      },
      checkedAllChange(val) {
        let that = this;
        if (val) {
          var temp = [];
          for (let i = 0; i < that.filtersBak.length; i++) {
            temp.push(that.filtersBak[i].value);
          }
        //   if (temp.length !== that.filterSet.length || that.filteredValue.length > 0) {
              that.filteredValue = temp;
        //   } else {
            //   that.showPopper = false;
        //   }
        } else {
          that.filteredValue = [];
        }
        that.isIndeterminate = false;
      },
      setFilterSet() {
        let that = this;
        let column = that.column;
        let exchangeFilterMap = that.exchangeFilterMap;
        let data = that.table.store.states.data;
        let filterTemp = [{
            label: '空',
            value: ''
        }];
        let obj = {};
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
        
        that.filterSet = filterTemp;
        that.filtersBak = that.filterSet;
        that.filteredValue = that.table.store.states['columnFilterValArr' + that.cellIndex];
        that.searchFilterEvent()
        // that.handleCheckedChange(that.filteredValue);
      },
      setFilterEvent() {
        this.table.store.states['columnFilterValArr' + this.cellIndex] = this.filteredValue;
        this.table.store.commit('icoreFilterMethod', {
            column: this.column,
            cellIndex: this.cellIndex
        });
        this.showPopper = false;
      }
    },

    data() {
      return {
        table: null,
        cell: null,
        filteredValue: [],
        searchFilter: '',
        filterSet: [],
        filtersBak: [],
        isIndeterminate: false,
        checkAll: false,
        count: 0,
        icorePanelShown: 50
      };
    },
    mounted() {
      let that = this;
      this.popperElm = this.$el;
      this.referenceElm = this.cell;  
      this.table.bodyWrapper.addEventListener('scroll', () => {
        this.updatePopper();
      });
      this.setFilterSet();
      this.$nextTick(()=>{
        
        this.$refs.scrollArea.$el.getElementsByClassName('el-table-filter__wrap')[0].addEventListener('scroll', function(e) {
            if (this.scrollHeight - this.clientHeight <= this.scrollTop && ((that.count + 1) * that.icorePanelShown + that.icorePanelShown) <= that.filtersBak.length) {
                that.count += 1;
                that.$nextTick(()=>{
                    this.scrollTop = 10;
                })
            }
            if (0 === this.scrollTop && that.count != 0) {
                that.count = that.count - 1 < 0 ? 0 : (that.count - 1);
                that.$nextTick(()=>{
                    this.scrollTop = this.scrollHeight - this.clientHeight - 10;
                })
            }
        });
      });
    },
    watch: {
      showPopper(val) {
        if (val === true && parseInt(this.popperJS._popper.style.zIndex, 10) < PopupManager.zIndex) {
          this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
          if (this.table.store.states['columnFilterValArr' + this.cellIndex].length === 0) {
                this.setFilterSet()
          }
        }
      }
    }
  };
</script>
<style lang="scss" scoped>
    .icore-filter-input-area {
        padding: 5px 3px;
    }
</style>

