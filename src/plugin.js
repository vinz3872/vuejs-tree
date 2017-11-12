import Tree from './Tree.vue';

module.exports = {
  install: function (Vue, options) {
    Vue.component('vue-tree', Tree);
  }
};