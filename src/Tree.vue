<template>
  <div id="tree">
    <ul
      :style="styles.tree"
      v-if="force">
      <template v-for="node in nodes">
        <tree-row
          :custom-options="customOptions"
          :custom-styles="customStyles"
          :depth="1"
          :key="node.id"
          :node="node"
          :parent-node="node"
          v-on:emitNodeChecked="onNodeChecked"
          v-on:emitNodeExpanded="onNodeExpanded"
          v-on:emitNodeSelected="onNodeSelected">
        </tree-row>
      </template>
    </ul>
  </div>
</template>

<script>
  import TreeRow from './TreeRow.vue'

  export default {
    name: 'tree',
    props: {
      customOptions: {
        default: () => {return {}},
        type: Object,
      },
      customStyles: {
        default: () => {return {}},
        type: Object,
      },
      id: String,
      nodes: {
        type: Array,
        required: true
      }
    },
    data: function() {
      return {
        styles: {
          tree: {
            height: "auto",
            maxHeight: "500px",
            overflowY: "scroll",
            display: "inline-block",
          },
        },
        options: {
          treeEvents: {
            expanded: {
              state: false,
              fn: null,
            },
            collapsed: {
              state: false,
              fn: null,
            },
            selected: {
              state: false,
              fn: null,
            },
            checked: {
              state: false,
              fn: null,
            }
          }
        },
        selectedNode: null,
        expandedNodes: {},
        force: true,
      }
    },
    components: {
      'tree-row': TreeRow,
    },
    mounted: function() {
      this.copyOptions(this.customOptions, this.options);
      this.copyOptions(this.customStyles, this.styles);
    },
    methods: {
      forceRender: function(nodes) {
        const _this = this;
        this.nodes = [];
        this.$nextTick(function() {
          _this.nodes = nodes;
        });
      },
      copyOptions: function(src, dst) {
        for(var key in src) {
          if (!dst[key]) {
            dst[key] = src[key];
          } else if (typeof(src[key]) == "object") {
            this.copyOptions(src[key], dst[key]);
          } else {
            dst[key] = src[key];
          }
        }
      },
      recFindNodePath: function(nodeId, nodes, depth, maxDepth) {
        const _this = this;
        let ret = [];

        nodes.forEach(function(node) {
          let tmp = [];
          if (nodeId == node.id && maxDepth >= depth) {
            ret.unshift(node.id);
            return false;
          } else if (node.nodes && maxDepth > depth && (tmp = _this.recFindNodePath(nodeId, node.nodes, depth + 1, maxDepth)) != null) {
            tmp.unshift(node.id);
            ret = tmp;
            return false;
          }
        })

        if (ret.length == 0) return null;
        return ret;
      },
      findNodePath: function(nodeId, maxDepth = 9999) {
        return this.recFindNodePath(nodeId, this.nodes, 1, maxDepth)
      },
      recFindNode: function(nodeId, nodes, depth, maxDepth) {
        const _this = this;
        let ret = null;

        nodes.forEach(function(node) {
          let tmp = [];
          if (nodeId == node.id && maxDepth >= depth) {
            ret = node;
            return false;
          } else if (node.nodes && maxDepth > depth && (tmp = _this.recFindNode(nodeId, node.nodes, depth+1, maxDepth)) != null) {
            ret = tmp;
            return false;
          }
        })

        return ret;
      },
      findNode: function(nodeId, maxDepth = 9999) {
        return this.recFindNode(nodeId, this.nodes, 1, maxDepth)
      },
      onNodeSelected: function(nodeSelected) { // called when a TreeRow is selected
        const _this = this;

        if (this.selectedNode == null && nodeSelected.state.selected == true) {
          this.selectedNode = nodeSelected;
        } else if (this.selectedNode != null && nodeSelected.state.selected == false) {
          this.selectedNode = null;
        } else if (this.selectedNode != null && nodeSelected.state.selected == true) {
          const arrIds = this.findNodePath(this.selectedNode.id, this.selectedNode.depth)
          this.callSpecificChild(arrIds, 'callNodeSelected', {value: false, arrIds: arrIds});
          this.selectedNode = nodeSelected;
          this.$nextTick(function() {
            const selectArrIds = _this.findNodePath(_this.selectedNode.id, _this.selectedNode.depth);
            _this.callSpecificChild(selectArrIds, 'callNodeSelected', {value: true, arrIds: selectArrIds});
          })

        }

        let fn = null;
        if (this.options.treeEvents.selected && this.options.treeEvents.selected.state == true) {
          fn = this.customOptions.treeEvents.selected.fn;
        }
        const state = (this.selectedNode == null) ? false : true;
        if(fn){
          fn(nodeSelected.id, state);
        }
      },
      onNodeExpanded: function(node, state) { // called when a TreeRow is expanded or closed
        if (state == false) {
          this.nodeCollapsed(node.id, null, node.depth);
        } else {
          this.nodeExpanded(node.id, null, node.depth);
        }
        let fn = null;
        if (state == true && this.options.treeEvents.expanded && this.options.treeEvents.expanded.state == true) {
          fn = this.customOptions.treeEvents.expanded.fn;
        } else if (this.options.treeEvents.collapsed && this.options.treeEvents.collapsed.state == true) {
          fn = this.customOptions.treeEvents.collapsed.fn;
        }
        if (fn){
          fn(node.id, state);
        }
      },
      onNodeChecked: function(node) { // called when a TreeRow is checked
        let fn = null;
        if (this.options.treeEvents.checked && this.options.treeEvents.checked.state == true) {
          fn = this.customOptions.treeEvents.checked.fn;
        }
        const state = node.state.checked;
        if (fn){
          fn(node.id, state);
        }
      },
      callSpecificChild: function(arrIds, fname, args) {
        for (let i = 0; i < this.$children.length; i++) {
          let currentNodeId = this.$children[i].$props.node.id;
          if (arrIds.find(x => x == currentNodeId)) {
            this.$children[i][fname](args);
            return false;
          }
        }
      },
      doCheckNode: function(nodeId, depth, state) {
        const arrIds = this.findNodePath(nodeId, depth);
        if (!arrIds) return;
        this.callSpecificChild(arrIds, 'callNodeChecked', {
          value: state,
          arrIds: arrIds
        });
      },
      checkNode: function(nodeId, depth) {
        this.doCheckNode(nodeId, depth, true);
      },
      uncheckNode: function(nodeId, depth) {
        this.doCheckNode(nodeId, depth, false);
      },
      getSelectedNode: function() {
        return this.selectedNode;
      },
      getCheckedNodes: function(argWanted, format = false) {
        return this.getNodesData(argWanted, {checked: true}, format);
      },
      getExpandedNodes: function(argWanted, format = false) {
        return this.getNodesData(argWanted, {expanded: true}, format);
      },
      checkAllNodes: function() {
        for (let i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesChecked(true);
        }
      },
      uncheckAllNodes: function() {
        for (let i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesChecked(false);
        }
      },
      recExpandAllNodes: function(nodes) {
        const openedTmp = {};
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].state.expanded = true;
          if (nodes[i].nodes) {
            openedTmp[nodes[i].id] = this.recExpandAllNodes(nodes[i].nodes);
          }
        }
        return openedTmp;
      },
      expandAllNodes: function() {
        const _this = this;
        const openedTmp = {};
        for (let i = 0; i < this.nodes.length; i++) {
          this.nodes[i].state.expanded = true;
            if (this.nodes[i].nodes) {
              openedTmp[this.nodes[i].id] = this.recExpandAllNodes(this.nodes[i].nodes);
            }
          }
        this.expandedNodes = openedTmp;
        this.forceRender(this.nodes);
      },
      recCollapseAllNodes: function(hashIds) {
        const _this = this;
        Object.entries(hashIds).forEach(function(arr) {
          _this.findNode(arr[0]).state.expanded = false;
          if (arr[1] && Object.keys(arr[1]).length > 0) _this.recCollapseAllNodes(arr[1]);
        });
      },
      collapseAllNodes: function() {
        const _this = this;
        let childNode;
        Object.entries(this.expandedNodes).forEach(function(arr) {
          _this.findNode(arr[0]).state.expanded = false;
          if (arr[1] && Object.keys(arr[1]).length > 0) _this.recCollapseAllNodes(arr[1]);
        });
        this.expandedNodes = {};
        this.forceRender(this.nodes);
      },
      deselectAllNodes: function() {
        this.selectedNode = null;
        for (let i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesDeselect();
        }
      },
      expandNode: function(nodeId, depth) {
        const arrIds = this.findNodePath(nodeId, depth);

        this.nodeExpanded(nodeId, arrIds);
        this.callSpecificChild(arrIds, 'callNodeExpanded', {
          value: true,
          arrIds: arrIds
        })
      },
      selectNode: function(nodeId, depth) {
        const nodeSelected = this.findNode(nodeId, depth);
        const _this = this;

        if (this.selectedNode) {
          let arrIds = this.findNodePath(this.selectedNode.id, this.selectedNode.depth);
          this.callSpecificChild(arrIds, 'callNodeSelected', {value: false, arrIds: arrIds});
        }
        this.selectedNode = nodeSelected;

        if (this.selectedNode) {
          this.$nextTick(function() {
            const selectArrIds = _this.findNodePath(_this.selectedNode.id, _this.selectedNode.depth);
            _this.callSpecificChild(selectArrIds, 'callNodeSelected', {value: true, arrIds: selectArrIds});
          })
        }
      },
      nodeExpanded: function(nodeId, arrIds, depth) {
        if (arrIds == undefined) {
          arrIds = this.findNodePath(nodeId, depth);
        }
        const hash = this.expandedNodes;
        let tmpElem = hash;
        arrIds.forEach(function(id) {
          if (!tmpElem[id]) {
            tmpElem[id] = {};
          }
          tmpElem = tmpElem[id];
        })
      },
      collapseNode: function(nodeId, depth) {
        const arrIds = this.findNodePath(nodeId, depth);
        this.nodeCollapsed(nodeId, arrIds);
        this.callSpecificChild(arrIds, 'callNodeExpanded', {
          value: false,
          arrIds: arrIds
        })
      },
      nodeCollapsed: function(nodeId, arrIds, depth) {
        if (arrIds == undefined) {
          arrIds = this.findNodePath(nodeId, depth);
        }
        const hash = this.expandedNodes;
        let tmpElem = hash;

        arrIds.forEach(function(id, i) {
          if (!tmpElem[id]) {
            return false;
          } else if (i == arrIds.length - 1 && tmpElem[id]) {
            delete tmpElem[id];
          }
          tmpElem = tmpElem[id];
        });
      },
      recGetVisibleNodes: function(arr, elem, fullNode) {
        const _this = this;
        const node = elem.$props.node;
        if (fullNode == true) {
          arr.push(node);
        } else {
          arr.push(node.id);
        }

        elem.$children.forEach(function(child) {
          arr = _this.recGetVisibleNodes(arr, child, fullNode);
        })
        return arr;
      },
      getVisibleNodes: function(fullNode = false) {
        const _this = this;
        let arr = [];

        this.$children.forEach(function(child) {
          arr = _this.recGetVisibleNodes(arr, child, fullNode);
        })
        return arr;
      },
      recGetNodesData: function(argWanted, conditions, nodes) {
        const _this = this;
        let arr = [];
        if (nodes == undefined) return arr;
        nodes.forEach(function(node) {
          if (node.state && Object.keys(node.state).filter(key => conditions[key] == node.state[key]).length == Object.keys(conditions).length) {
            if (Array.isArray(argWanted)) {
              arr.push(Object.keys(node).filter(key => argWanted.includes(key)).reduce((obj, key) => {
                obj[key] = node[key];
                return obj;
              }, {}));
            } else {
              arr.push(node[argWanted]);
            }
          }
          arr = arr.concat(_this.recGetNodesData(argWanted, conditions, node.nodes));
        })
        return arr;
      },
      recGetNodesDataWithFormat: function(argWanted, conditions, nodes) {
        const _this = this;
        let arr = {};
        if (nodes == undefined || nodes.length == 0) return arr;
        nodes.forEach(function(node) {

          if (node.state && Object.keys(node.state).filter(key => conditions[key] == node.state[key]).length == Object.keys(conditions).length) {
            arr[node.id] = _this.recGetNodesDataWithFormat(argWanted, conditions, node.nodes);
          } else {
            Object.assign(arr, _this.recGetNodesDataWithFormat(argWanted, conditions, node.nodes));
          }
        })
        return arr;
      },
      getNodesData: function(argWanted, conditions = {}, format = false) {
        // argWanted: id -> return id, id1 etc... argWanted: id, name -> return {id: id, name: name}, {id: id1, name: name1}, etc
        // conditions {checked: true} conditions {checked: true, selected: true}
        let arr = null;
        if (format == false) {
          arr = this.recGetNodesData(argWanted, conditions, this.nodes);
        } else {
          arr = this.recGetNodesDataWithFormat(argWanted, conditions, this.nodes);
        }
        return arr;
      }
    }
  }
</script>