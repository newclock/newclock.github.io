<template>
  <transition name="el-zoom-in-top">
    <div
      class="el-table-filter"
      v-if="multiple"
      v-clickoutside="handleOutsideClick"
      v-show="showPopper">
      <div class="el-table-filter__content">
        <el-input v-if="filters && filters.length > 5"
          placeholder="请输入内容"
          prefix-icon="el-icon-search"
          @keyup.native="searchFilterEvent"
          v-model="searchFilter">
        </el-input>
        <el-scrollbar wrap-class="el-table-filter__wrap">
          <el-checkbox-group class="el-table-filter__checkbox-group" @change="handleCheckedChange" v-model="filteredValue">
            <el-checkbox
              v-for="filter in filtersBak"
              :key="filter.value"
              :label="filter.value">{{ filter.text }}</el-checkbox>
          </el-checkbox-group>
        </el-scrollbar>
      </div>
      <div class="el-table-filter__bottom">
        <el-checkbox :indeterminate="isIndeterminate"  v-model="checkAll" @change="checkedAllChange">全选</el-checkbox>
        <button @click="handleConfirm"
          :class="{ 'is-disabled': filteredValue.length === 0 }"
          :disabled="filteredValue.length === 0">{{ t('el.table.confirmFilter') }}</button>
        <button @click="handleReset">{{ t('el.table.resetFilter') }}</button>
      </div>
    </div>
    <div
      class="el-table-filter"
      v-else
      v-clickoutside="handleOutsideClick"
      v-show="showPopper">
      <ul class="el-table-filter__list">
        <li class="el-table-filter__list-item"
            :class="{ 'is-active': filterValue === undefined || filterValue === null }"
            @click="handleSelect(null)">{{ t('el.table.clearFilter') }}</li>
        <li class="el-table-filter__list-item"
            v-for="filter in filtersBak"
            :label="filter.value"
            :key="filter.value"
            :class="{ 'is-active': isActive(filter) }"
            @click="handleSelect(filter.value)" >{{ filter.text }}</li>
      </ul>
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

    customRender(h) {
      return (<div class="el-table-filter">
        <div class="el-table-filter__content">
        </div>
        <div class="el-table-filter__bottom">
          <button on-click={ this.handleConfirm }>{ this.t('el.table.confirmFilter') }</button>
          <button on-click={ this.handleReset }>{ this.t('el.table.resetFilter') }</button>
        </div>
      </div>);
    },

    methods: {
      searchFilterEvent() {
        let that = this;
        if (that.searchFilter !== '') {
          var temp = that.filters.filter(function(val) {
            return val.value.indexOf(that.searchFilter) > -1;
          });
          that.filtersBak = temp;
        } else {
          that.filtersBak = that.filters;
        }
        that.handleCheckedChange(that.filteredValue);
      },
      handleCheckedChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.filtersBak.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.filtersBak.length;
      },
      checkedAllChange(val) {
        let that = this;
        if (val) {
          var temp = [];
          for (let i = 0; i < that.filtersBak.length; i++) {
            temp.push(that.filtersBak[i].value);
          }
          that.filteredValue = temp;
        } else {
          that.filteredValue = [];
        }
        that.isIndeterminate = false;
      },
      isActive(filter) {
        return filter.value === this.filterValue;
      },

      handleOutsideClick() {
        setTimeout(() => {
          this.showPopper = false;
        }, 16);
      },

      handleConfirm() {
        this.confirmFilter(this.filteredValue);
        this.handleOutsideClick();
      },

      handleReset() {
        this.filteredValue = [];
        this.confirmFilter(this.filteredValue);
        this.handleOutsideClick();
        this.isIndeterminate = false;
        this.checkAll = false;  
        this.searchFilter = '';
      },

      handleSelect(filterValue) {
        this.filterValue = filterValue;

        if ((typeof filterValue !== 'undefined') && (filterValue !== null)) {
          this.confirmFilter(this.filteredValue);
        } else {
          this.confirmFilter([]);
        }

        this.handleOutsideClick();
      },

      confirmFilter(filteredValue) {
        this.table.store.commit('filterChange', {
          column: this.column,
          values: filteredValue
        });
        this.table.store.updateAllSelected();
      }
    },

    data() {
      return {
        table: null,
        cell: null,
        column: null,
        isIndeterminate: false,
        checkAll: false,
        searchFilter: '',
        filtersBak: []
      };
    },

    computed: {
      filters: {
        get() {
          this.filtersBak = this.column && this.column.filters;
					return this.column && this.column.filters;
        }
      },

      filterValue: {
        get() {
          return (this.column.filteredValue || [])[0];
        },
        set(value) {
          if (this.filteredValue) {
            if ((typeof value !== 'undefined') && (value !== null)) {
              this.filteredValue.splice(0, 1, value);
            } else {
              this.filteredValue.splice(0, 1);
            }
          }
        }
      },

      filteredValue: {
        get() {
          if (this.column) {
            return this.column.filteredValue || [];
          }
          return [];
        },
        set(value) {
          if (this.column) {
            this.column.filteredValue = value;
          }
        }
      },

      multiple() {
        if (this.column) {
          return this.column.filterMultiple;
        }
        return true;
      }
    },

    mounted() {
      this.popperElm = this.$el;
      this.referenceElm = this.cell;
      this.table.bodyWrapper.addEventListener('scroll', () => {
        this.updatePopper();
      });

      this.$watch('showPopper', (value) => {
        if (this.column) this.column.filterOpened = value;
        if (value) {
          Dropdown.open(this);
        } else {
          Dropdown.close(this);
        }
      });
    },
    watch: {
      showPopper(val) {
        if (val === true && parseInt(this.popperJS._popper.style.zIndex, 10) < PopupManager.zIndex) {
          this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
        }
      }
    }
  };
</script>
