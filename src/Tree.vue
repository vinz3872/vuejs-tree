<template>
  <div id="tree">
    <ul :style="options.style.tree" v-if="force">
      <template v-for="node in nodes">
        <tree-row v-on:emitNodeSelected="nodeSelected" v-on:emitNodeExpanded="nodeExpanded" v-on:emitNodeChecked="nodeChecked" :node="node" :depth="1" :custom_options="custom_options" :parent_node="node"></tree-row>
      </template>
    </ul>
  </div>
</template>

<script>
  import TreeRow from './TreeRow.vue'

  export default {
    name: 'tree',
    props: {
      nodes: Array,
      custom_options: Object,
      id: String
    },
    data: function() {
      return {
        options: {
          style: {
            tree: 'height: auto;max-height: 500px;overflow-y: scroll;border: 1px solid #ddd;display: inline-block;',
          },
          tree_events: {
            expanded: {
              state: false,
              fn: null
            },
            collapsed: {
              state: false,
              fn: null
            },
            selected: {
              state: false,
              fn: null
            },
            checked: {
              state: false,
              fn: null
            }
          }
        },
        selected_node: null,
        opened_nodes: {},
        checked_nodes: {},
        force: true
      }
    },
    components: {
      'tree-row': TreeRow
    },
    mounted: function() {
      this.init_tree();
      },
      methods: {
        forceRender: function(nodes) {
          this.nodes = nodes;
      },
      init_tree: function() {
        if (this.custom_options) {
          if (this.custom_options.style && this.custom_options.style.tree) {
            this.options.style.tree = this.custom_options.style.tree;
          }
          if (this.custom_options.tree_events) {
            var events = this.custom_options.tree_events;
            if (events.expanded) {
              if (events.expanded.state != undefined) this.options.tree_events.expanded.state = events.expanded.state;
                if (events.expanded.fn) this.options.tree_events.expanded.fn = events.expanded.fn;
              }
            if (events.collapsed) {
              if (events.collapsed.state != undefined) this.options.tree_events.collapsed.state = events.collapsed.state;
                if (events.collapsed.fn) this.options.tree_events.collapsed.fn = events.collapsed.fn;
              }
            if (events.selected) {
              if (events.selected.state != undefined) this.options.tree_events.selected.state = events.selected.state;
                if (events.selected.fn) this.options.tree_events.selected.fn = events.selected.fn;
              }
            if (events.checked) {
              if (events.checked.state != undefined) this.options.tree_events.checked.state = events.checked.state;
                if (events.checked.fn) this.options.tree_events.checked.fn = events.checked.fn;
              }
          }
        }
      },
      findNodePathRec: function(node_id, nodes, ret, depth, max_depth) {
        var _this = this;

        nodes.forEach(function(node) {
          var tmp = [];
          if (node_id == node.id && max_depth >= depth) {
            ret.unshift(node.id);
            return false;
          } else if (node.nodes && max_depth > depth && (tmp = _this.findNodePathRec(node_id, node.nodes, ret, depth+1, max_depth)) != null) {
            tmp.unshift(node.id);
            ret = tmp;
            return false;
          }
        })

        if (ret.length == 0) return null;
        return ret;
      },
      findNodePath: function(node_id, max_depth) {
        var _this = this;
        var ret = [];
        var tmp = [];
        var depth = 1
        if (max_depth == undefined || max_depth == null) var max_depth = 9999;
        _this.nodes.forEach(function(node) {
          if (node_id == node.id && max_depth >= depth) {
            ret.unshift(node.id);
            return false;
          } else if (node.nodes && max_depth > depth && (tmp = _this.findNodePathRec(node_id, node.nodes, ret, depth+1, max_depth)) != null) {
            tmp.unshift(node.id);
            ret = tmp;
            return false;
          }
        })

        if (ret.length == 0) return null;
        return ret;
      },
      findNodeRec: function(node_id, nodes, ret, depth, max_depth) {
        var _this = this;

        nodes.forEach(function(node) {
          var tmp = [];
          if (node_id == node.id && max_depth >= depth) {
            ret = node;
            return false;
          } else if (node.nodes && max_depth > depth && (tmp = _this.findNodeRec(node_id, node.nodes, ret, depth+1, max_depth)) != null) {
            ret = tmp;
            return false;
          }
        })

        return ret;
      },
      findNode: function(node_id, max_depth) {
        var _this = this;
        var ret = null;
        var tmp = null;
        if (max_depth == undefined || max_depth == null) max_depth = 9999;
        var depth = 1;
        _this.nodes.forEach(function(node) {
          if (node_id == node.id && max_depth >= depth) {
            ret = node;
            return false;
          } else if (node.nodes && max_depth > depth && (tmp = _this.findNodeRec(node_id, node.nodes, ret, depth+1, max_depth)) != null) {
            ret = tmp;
            return false;
          }
        })

        return ret;
      },
      nodeSelected: function(node_selected) { // called when a TreeRow is selected
        let _this = this;
        if (this.selected_node == null && node_selected.state.selected == true) {
          this.selected_node = node_selected;
        } else if (this.selected_node != null && node_selected.state.selected == false) {
          this.selected_node = null;
        } else if (this.selected_node != null && node_selected.state.selected == true) {
          let arr_ids = this.findNodePath(this.selected_node.id, this.selected_node.depth)
          this.callSpecificChild(arr_ids, 'callNodeSelected', {value: false, arr_ids: arr_ids});
          this.selected_node = node_selected;
          this.$nextTick(function() {
            let select_arr_ids = _this.findNodePath(_this.selected_node.id, _this.selected_node.depth);
            _this.callSpecificChild(select_arr_ids, 'callNodeSelected', {value: true, arr_ids: select_arr_ids});
          })

        }

        let fn = null;
        if (this.options.tree_events.selected && this.options.tree_events.selected.state == true) {
          fn = this.custom_options.tree_events.selected.fn;
        }
        let state = (this.selected_node == null) ? false : true;
        if(fn){
          fn(node_selected.id, state);
        }
      },
      nodeExpanded: function(node, state) { // called when a TreeRow is expanded or closed
        if (state == false) {
          this.nodeClosed(node.id, null, node.depth);
        } else {
          this.nodeOpened(node.id, null, node.depth);
        }
        var fn = null;
        if (state == true && this.options.tree_events.expanded && this.options.tree_events.expanded.state == true) {
          var fn = this.custom_options.tree_events.expanded.fn;
        } else if (this.options.tree_events.collapsed.state == true && this.options.tree_events.collapsed.state == true) {
          var fn = this.custom_options.tree_events.collapsed.fn;
        }
        if(fn){
          fn(node.id, state);
        }
      },
      nodeChecked: function(node) {
        var fn = null;
        if (this.options.tree_events.checked && this.options.tree_events.checked.state == true) {
          var fn = this.custom_options.tree_events.checked.fn;
        }
        let state = node.state.checked;
        if(fn){
          fn(node.id, state);
        }
      },
      callSpecificChild: function(arr_ids, fname, args) {
        for (var i = 0; i < this.$children.length; i++) {
          var current_node_id = this.$children[i].$props.node.id;
          if (arr_ids.find(x => x == current_node_id)) {
            this.$children[i][fname](args);
            return false;
          }
        }
      },
      checkNode: function(node_id, depth) {
        var arr_ids = this.findNodePath(node_id, depth);
        if (!arr_ids) return;
        this.callSpecificChild(arr_ids, 'callNodeChecked', {
          value: true,
          arr_ids: arr_ids
        });
      },
      uncheckNode: function(node_id, depth) {
        var arr_ids = this.findNodePath(node_id, depth);
        this.callSpecificChild(arr_ids, 'callNodeChecked', {
          value: false,
          arr_ids: arr_ids
        });
      },
      getSelected: function() {
        return this.selected_node;
      },
      recGetChecked(nodes) {
        let checked = [];
        let _this = this;

        nodes.forEach(function(node) {
          if (node.state.checked == true) {
            checked.push(node.id);
          }
          checked.concat(_this.recGetChecked(node.nodes));
        })

        return checked;
      },
      getChecked: function() {
        let checked = [];
        let _this = this;

        _this.nodes.forEach(function(node) {
          if (node.state.checked == true) {
            checked.push(node.id);
          }
          checked.concat(_this.recGetChecked(node.nodes));
        })

        return checked;
      },
      recGetOpened: function(nodes) {
        var opened = [];

        for (var node_id in nodes) {
          opened.unshift(node_id);
          var child = this.recGetOpened(nodes[node_id]);
          opened = opened.concat(child);
        }
        return opened;
      },
      getOpened: function() {
        var opened = [];

        for (var node_id in this.opened_nodes) {
          opened.unshift(node_id);
          var child = this.recGetOpened(this.opened_nodes[node_id]);
          opened = opened.concat(child);
        }
        return opened;
      },
      recGetOpenedWithTree: function(nodes, opened_tree) {
        var opened = {};
        for (var num in nodes) {
          var key = nodes[num].id;
          if (key != undefined) {
            if (opened_tree != undefined && opened_tree[key] != undefined) {
              opened[key] = this.recGetOpenedWithTree(nodes[num].nodes, opened_tree[key]);
            } else {
              opened[key] = {};
            }
          }
        }
        return opened;
      },
      getOpenedWithTree: function() {
        var opened = {};

        for (var num in this.nodes) {
          var key = this.nodes[num].id;
          if (key != undefined) {
            if (this.opened_nodes[key] != undefined) {
              opened[key] = this.recGetOpenedWithTree(this.nodes[num].nodes, this.opened_nodes[key]);
            } else {
              opened[key] = {};
            }
          }
        }
        return opened;
      },
      checkAll: function() {
        for (var i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesChecked(true);
        }
      },
      uncheckAll: function() {
        for (var i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesChecked(false);
        }
      },
      recUpdateExpandAll: function(nodes) {
        let opened_tmp = {};
        for (var i = 0; i < nodes.length; i++) {
          opened_tmp[nodes[i].id] = this.recUpdateExpandAll(nodes[i].nodes);
        }
        return opened_tmp;
      },
      expandAll: function() {
        for (var i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesExpanded(true);
        }
        this.$nextTick(function() {
          this.opened_nodes = {};
          let opened_tmp = {};
          for (var i = 0; i < this.nodes.length; i++) {
            opened_tmp[this.nodes[i].id] = this.recUpdateExpandAll(this.nodes[i].nodes);
          }
          this.opened_nodes = opened_tmp;
        })
      },
      collapseAll: function() {
        for (var i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesExpanded(false);
        }
        this.opened_nodes = {};
      },
      unselectAll: function() {
        this.selected_node = null;
        for (var i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesUnselect();
        }
      },
      openNode: function(node_id, depth) {
        var arr_ids = this.findNodePath(node_id, depth);

        this.nodeOpened(node_id, arr_ids);
        this.callSpecificChild(arr_ids, 'callNodeExpanded', {
          value: true,
          arr_ids: arr_ids
        })
      },
      selectNode: function(node_id, depth) {
        let node_selected = this.findNode(node_id, depth);
        let _this = this;

        if (this.selected_node) {
          let arr_ids = this.findNodePath(this.selected_node.id, this.selected_node.depth);
          this.callSpecificChild(arr_ids, 'callNodeSelected', {value: false, arr_ids: arr_ids});
        }
        this.selected_node = node_selected;

        if (this.selected_node) {
          this.$nextTick(function() {
            let select_arr_ids = _this.findNodePath(_this.selected_node.id, _this.selected_node.depth);
            _this.callSpecificChild(select_arr_ids, 'callNodeSelected', {value: true, arr_ids: select_arr_ids});
          })
        }
      },
      nodeOpened: function(node_id, arr_ids, depth) {
        if (arr_ids == undefined) {
          arr_ids = this.findNodePath(node_id, depth);
        }
        var hash = this.opened_nodes;
        var tmp_elem = hash;
        arr_ids.forEach(function(id) {
          if (!tmp_elem[id]) {
            tmp_elem[id] = {};
          }
          tmp_elem = tmp_elem[id];
        })
      },
      closeNode: function(node_id, depth) {
        var arr_ids = this.findNodePath(node_id, depth);
        this.nodeClosed(node_id, arr_ids);
        this.callSpecificChild(arr_ids, 'callNodeExpanded', {
          value: false,
          arr_ids: arr_ids
        })
      },
      nodeClosed: function(node_id, arr_ids, depth) {
        if (arr_ids == undefined) {
          arr_ids = this.findNodePath(node_id, depth);
        }
        var hash = this.opened_nodes;
        var tmp_elem = hash;

        arr_ids.forEach(function(id, i) {
          if (!tmp_elem[id]) {
            return false;
          } else if (i == arr_ids.length - 1 && tmp_elem[id]) {
            delete tmp_elem[id];
          }
          tmp_elem = tmp_elem[id];
        });
      },
      recGetVisible: function(arr, elem) {
        let _this = this;
        let id = elem.$props.node.id;
        arr.push(id);

        elem.$children.forEach(function(child) {
          arr = _this.recGetVisible(arr, child);
        })
        return arr;
      },
      getVisible: function() {
        let _this = this;
        let arr = [];

        this.$children.forEach(function(child) {
          arr = _this.recGetVisible(arr, child);
        })
        return arr;
      },
      recGetVisibleNodes: function(arr, elem) {
        let _this = this;
        let node = elem.$props.node;
        arr.push(node);

        elem.$children.forEach(function(child) {
          arr = _this.recGetVisibleNodes(arr, child);
        })
        return arr;
      },
      getVisibleNodes: function() {
        let _this = this;
        let arr = [];

        this.$children.forEach(function(child) {
          arr = _this.recGetVisibleNodes(arr, child);
        })
        return arr;
      },
    }
  }

  /*
  ** Methods:
  ** 
  ** checkNode: take a node_id and check it
  ** uncheckNode
  ** getSelected: get selected node
  ** getChecked : TODO
  ** getOpened: get array of node_ids ex : [1122, 44, 444]
  ** getOpenedWithTree: get tree with node_ids ex: {1122: {44: {}}, 444: {}}
  ** checkAll: check all nodes
  ** uncheckAll
  ** openNode: take a node_id and check it
  ** closeNode
  ** selectNode: select a node
  ** expandAll: expand all nodes
  ** collapseAll
  ** unselectAll: select all nodes
  ** findNode: take a node_id and return the node
  ** getVisible: get array of all visible nodes ids
  ** getVisibleNodes: get array of all visible nodes
  **
  */

  // function to get tree by id
  // use this or vm_var_name
  // function getTree(tree_id) {
  //   for (var i = 0; i <= vm.$children.length - 1; i++) {
  //     if (vm.$children[i].$props.id == tree_id) return vm.$children[i]
  //   }
  // }

</script>