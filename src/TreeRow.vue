<template>
  <li
    class="node"
    :data-id="node.id"
    :style="options.style.row"
    v-on:click.stop="toggleEvent('selected', node, 'node', $event)">
    <div :style="options.style.row.child">
      <span v-on:click.stop="options.events.expanded.state == true && node.nodes != undefined && node.nodes.length > 0 && toggleEvent('expanded', node)">
        <span v-for="(count, index) in depth" class="tree-indent" v-bind:key="index"></span>
        <i
          v-if="options.events.expanded.state == true && node.nodes != undefined && node.nodes.length > 0"
          class="fa"
          v-bind:class="{'fa-caret-right': expanded == false, 'fa-caret-down': expanded == true}"
          aria-hidden="true">
        </i>
        <span
          v-else-if="options.events.expanded.state == true && node.nodes == undefined"
          class="small-tree-indent">
        </span>
      </span>
      <i
        v-if="options.events.selected.state == true"
        v-on:click.stop="toggleEvent('selected', node)"
        class="fa"
        v-bind:class="{[options.icon]: expanded == false, [options.selectedIcon]: expanded == true}"
        aria-hidden="true"
        :style="'color:' + (selected == false ? options.iconColor : options.selectedIconColor)">
      </i>
      <input
        type="checkbox"
        name="item[]"
        :data-id="node.id"
        :checked="checked"
        v-if="options.events.checked.state == true"
        v-on:click.stop="toggleEvent('checked', node)"
      >
      <span
        data-toggle="tooltip"
        data-placement="top"
        :title="node.definition"
        class="capitalize"
        v-bind:class="{'selected': selected}"
        :style="options.colorNameWhenSelected && selected ? ('color:' + options.selectedIconColor + '; font-weight: bold') : ''"
        v-on:click.stop="options.events.editableName.state && toggleEvent('editableName', node)" >
        {{ node.text }}
      </span>
      <span
        v-if="options.addNodes.state == true"
        v-on:click='options.addNodes.fn(node)'>
        <i
          :class="'fa ' + options.addElemIcon"
          :style="'color:' + options.addElemIconColor"
          aria-hidden="true">
        </i>
      </span>
      <span v-if="options.showTags == true">
        <span
          v-if="node.tags[0] != undefined && node.tags[0]!= null && node.tags[0]"
          class="badge">
          {{ node.tags[0] }}
        </span>
      </span>
    </div>
    <ul v-if="expanded">
      <template v-for="child in node.nodes">
        <tree-row
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          :custom-options="customOptions"
          :parent-node="node"
          v-on:emitNodeSelected="emitNodeSelected"
          v-on:emitNodeExpanded="emitNodeExpanded"
          v-on:emitNodeChecked="emitNodeChecked">
        </tree-row>
      </template>
    </ul>
  </li>
</template>

<script type="text/javascript">
  export default {
    name: 'tree-row',
    props: {
      node: {
        type: Object,
        required: true
      },
      depth: Number,
      customOptions: Object,
      parentNode: Object
    },
    data: function() {
      return {
        options: {
          icon: "fa-folder",
          iconColor: "#007AD5",
          selectedIcon: "fa-folder-open",
          selectedIconColor: "#2ECC71",
          addElemIcon: 'fa-plus',
          addElemIconColor: '#007AD5',
          events: {
            expanded: {
              state: true,
              fn: this.toggleExpanded
            },
            selected: {
              state: true,
              fn: this.toggleSelected
            },
            checked: {
              state: true,
              fn: this.toggleChecked
            },
            editableName: {
              state: false,
              fn: null,
              calledEvent: null
            }
          },
          style: {
            row: {
              width: '500px',
              cursor: 'pointer',
              child: {
                height: '35px'
              },
            },
          },
          addNodes: {state: false, fn: null},
          showTags: false,
          colorNameWhenSelected: true,
          titleSelectable: true
        },
        checked: false,
        expanded: false,
        selected: false
      }
    },
    watch: {
      checked: function() {
        this.node.state.checked = this.checked;
      },
      expanded: function() {
        this.node.state.expanded = this.expanded;
      },
      selected: function() {
        this.node.state.selected = this.selected;
      }
    },
    mounted: function() {
      this.initEvents();
      if (this.node.state) {
        this.checked = this.node.state.checked;
        this.expanded = this.node.state.expanded;
        this.selected = this.node.state.selected;
      } else {
        this.node.state = {checked: false, expanded: false, selected: false}
      }
    },
    methods: {
      toggleEvent: function(eventType, node) {
        if (eventType == 'editableName' && this.options.events['editableName'].calledEvent) {
          this.toggleEvent(this.options.events['editableName'].calledEvent, node);
        } else if (this.options.events[eventType].state == true) {
          const fnName = this.options.events[eventType].fn;
          fnName(node, this);
        }
      },
      toggleExpanded: function(node, instance) {
        this.expanded = !this.expanded;
        this.node.state.expanded = this.expanded;
        this.$nextTick(function() {
          this.$emit('emitNodeExpanded', node, this.expanded);
        })
      },
      toggleSelected: function(node, instance) {
        this.selected = !this.selected;
        this.node.state.selected = this.selected;
        this.$emit('emitNodeSelected', node);
      },
      toggleChecked: function(node, instance) {
        this.checked = !this.checked;
        this.node.state.checked = this.checked;
        this.$nextTick(function() {
          this.callNodesChecked(this.checked);
          this.$emit('emitNodeChecked', node);
        })
      },
      emitNodeSelected: function(nodeSelected) { // redirect the event toward the Tree component
        this.$emit('emitNodeSelected', nodeSelected);
      },
      emitNodeExpanded: function(node, state) { // redirect the event toward the Tree component
        this.$emit('emitNodeExpanded', node, state);
      },
      emitNodeChecked: function(nodeChecked) { // redirect the event toward the Tree component
        this.$emit('emitNodeChecked', nodeChecked);
      },
      recCallNodes: function(state, event, nodes) {
        const _this = this;
        nodes.forEach(function(node) {
          if (!node.state) node.state = {checked: false, expanded: false, selected: false}
          node.state[event] = state;
          if (node.nodes) {
            _this.recCallNodes(state, event, node.nodes);
          }
        })
      },
      callNodesChecked: function(state) {
        this.checked = state;
        for (let i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesChecked(state);
        }
        if (this.$children.length == 0 && this.node.nodes && this.node.nodes.length > 0) {
          this.recCallNodes(state, "checked", this.node.nodes);
        }
      },
      callNodesDeselect: function() {
        this.selected = false;
        this.node.state.selected = this.selected;
        for (let i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesDeselect();
        }
        if (this.$children.length == 0 && this.node.nodes&& this.node.nodes.length > 0) {
          this.recCallNodes(false, "selected", this.node.nodes);
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
      callNodeChecked: function(args) {
        const arrIds = args.arrIds;
        const value = args.value;
        if (arrIds.last() == this.node.id) {
          this.checked = value;
          this.callNodesChecked(this.checked);
        } else {
          this.expanded = true;
          this.$nextTick(function() {
            this.callSpecificChild(arrIds, 'callNodeChecked', args);
          })
        }
      },
      callNodeSelected: function(args) {
        const arrIds = args.arrIds;
        const value = args.value;
        if (arrIds.last() == this.node.id) {
          this.selected = value;
        } else {
          this.expanded = true;
          this.$nextTick(function() {
            this.callSpecificChild(arrIds, 'callNodeSelected', args);
          })
        }
      },
      callNodeExpanded: function(args) {
        const arrIds = args.arrIds;
        const value = args.value;
        if (value == false && this.expanded == false) return;
        if (arrIds.last() != this.node.id) {
          this.expanded = true;
          this.$nextTick(function() {
            this.callSpecificChild(arrIds, 'callNodeExpanded', args);
          })
        } else {
          this.expanded = value;
        }
      },
      initEvents: function() {
        this.node.depth = this.depth;
        if (this.customOptions) {
          this.options.events.checked.state = this.node.checkable != undefined ? this.node.checkable : true;
          this.options.events.selected.state = this.node.selectable != undefined ? this.node.selectable : true;
          this.options.events.expanded.state = this.node.expandable != undefined ? this.node.expandable : true;
          if (this.customOptions.events) {
            const events = this.customOptions.events;
            if (events.expanded) {
              if (events.expanded.state != undefined) this.options.events.expanded.state = events.expanded.state;
              if (events.expanded.fn) this.options.events.expanded.fn = events.expanded.fn;
            }
            if (events.selected) {
              if (events.selected.state != undefined) this.options.events.selected.state = events.selected.state;
              if (events.selected.fn) this.options.events.selected.fn = events.selected.fn;
            }
            if (events.checked) {
              if (events.checked.state != undefined) this.options.events.checked.state = events.checked.state;
              if (events.checked.fn) this.options.events.checked.fn = events.checked.fn;
            }
            if (events.editableName) {
              if (events.editableName.state != undefined) this.options.events.editableName.state = events.editableName.state;
              if (events.editableName.fn) this.options.events.editableName.fn = events.editableName.fn;
              if (events.editableName.calledEvent) this.options.events.editableName.calledEvent = events.editableName.calledEvent;
            }
          }
          if (this.customOptions.style && this.customOptions.style.row) {
            this.options.style.row = this.customOptions.style.row;
          }
          if (this.customOptions.style && this.customOptions.style.row.child) {
            this.options.style.row.child = this.customOptions.style.row.child;
          }
          if (this.customOptions.icon) {
            this.options.icon = this.customOptions.icon;
          }
          if (this.customOptions.iconColor) {
            this.options.iconColor = this.customOptions.iconColor;
          }
          if (this.customOptions.selectedIcon) {
            this.options.selectedIcon = this.customOptions.selectedIcon;
          }
          if (this.customOptions.selectedIconColor) {
            this.options.selectedIconColor = this.customOptions.selectedIconColor;
          }
          if (this.customOptions.addElemIcon) {
            this.options.addElemIcon = this.customOptions.addElemIcon;
          }
          if (this.customOptions.addElemIconColor) {
            this.options.addElemIconColor = this.customOptions.addElemIconColor;
          }
          if (this.customOptions.addNodes && this.customOptions.addNodes.state == true) {
            this.options.addNodes.state = true;
            this.options.addNodes.fn = this.customOptions.addNodes.fn;
          }
          if (this.customOptions.showTags) {
            this.options.showTags = this.customOptions.showTags;
          }
          if (this.customOptions.colorNameWhenSelected) {
            this.options.colorNameWhenSelected = this.customOptions.colorNameWhenSelected;
          }
          if (this.customOptions.titleSelectable) {
            this.options.titleSelectable = this.customOptions.titleSelectable;
          }
        }
      }
    }
  }

</script>


<style lang="scss" scoped>
  .tree-indent {
    margin-left: 10px;
    margin-right: 10px;
    display: inline-block;
    & + .fa {
      margin: 0 5px 0 0;
    }
  }
  .small-tree-indent {
    margin-left: 3px;
    margin-right: 3px;
    display: inline-block;
  }
  .capitalize {
    text-transform: capitalize;
  }
  .badge {
    font-size: 12px;
    font-weight: normal;
  }
</style>