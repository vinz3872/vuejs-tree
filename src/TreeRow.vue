<template>
  <li
    class="node"
    :data-id="node.id"
    :style="styles.row">
    <div class="row_data"
      :style="styles.row.child"
      @click="toggleEvent('selected', node, 'node', $event)">
      <span @click.stop="options.events.expanded.state == true && node.nodes != undefined && node.nodes.length > 0 && toggleEvent('expanded', node)">
        <span v-for="(count, index) in depth" class="tree-indent" v-bind:key="index"></span>
        <i
          v-if="options.events.expanded.state == true && node.nodes != undefined && node.nodes.length > 0"
          :class="[{'expanded': expanded == true}, styles.expanded.class, 'expanded_icon']">
        </i>
        <span
          v-else-if="options.events.expanded.state == true && node.nodes == undefined"
          class="small-tree-indent">
        </span>
      </span>
      <i
        v-if="options.events.selected.state == true"
        @click.stop="toggleEvent('selected', node)"
        :class="expanded ? styles.selectIcon.active.class : styles.selectIcon.class"
        :style="selected ? styles.selectIcon.active.style : styles.selectIcon.style">
      </i>
      <input
        type="checkbox"
        name="item[]"
        :data-id="node.id"
        :checked="checked"
        v-if="options.events.checked.state == true"
        @click="toggleEvent('checked', node)"
      >
      <span
        data-toggle="tooltip"
        data-placement="top"
        :title="node.definition"
        class="capitalize"
        v-bind:class="{'selected': selected}"
        :style="selected ? styles.text.active.style : styles.text.style"
        @click.stop="options.events.editableName.state && toggleEvent('editableName', node)" >
        {{ node.text }}
      </span>
      <span
        v-if="options.addNode.state == true"
        @click.stop="options.addNode.fn(node)"
        class="icon_parent">
        <i
          v-bind:class="[{'icon-hover': options.addNode.appearOnHover}, styles.addNode.class]"
          :style="styles.addNode.style">
        </i>
      </span>
      <span
        v-if="options.editNode.state == true"
        @click.stop="options.editNode.fn(node)"
        class="icon_parent">
        <i
        v-bind:class="[{'icon-hover': options.editNode.appearOnHover}, styles.editNode.class]"
        :style="styles.editNode.style">
        </i>
      </span>
      <span
        v-if="options.deleteNode.state == true"
        @click.stop="options.deleteNode.fn(node)"
        class="icon_parent">
        <i
        v-bind:class="[{'icon-hover': options.deleteNode.appearOnHover}, styles.deleteNode.class]"
        :style="styles.deleteNode.style">
        </i>
      </span>
      <span v-if="options.showTags == true && node.tags">
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
          :custom-options="customOptions"
          :custom-styles="customStyles"
          :depth="depth + 1"
          :key="child.id"
          :node="child"
          :parent-node="node"
          v-on:emitNodeChecked="emitNodeChecked"
          v-on:emitNodeExpanded="emitNodeExpanded"
          v-on:emitNodeSelected="emitNodeSelected">
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
        required: true,
      },
      depth: Number,
      customOptions: Object,
      customStyles: Object,
      parentNode: Object,
    },
    data: function() {
      return {
        styles: {
          row: {
            width: '500px',
            cursor: 'pointer',
            child: {
              height: '35px',
            },
          },
          expanded: {
            class: 'expanded_icon',
          },
          addNode: {
            class: 'add_icon',
            style: {
              color: '#007AD5',
            }
          },
          editNode: {
            class: 'edit_icon',
            style: {
              color: '#007AD5',
            }
          },
          deleteNode: {
            class: 'delete_icon',
            style: {
              color: '#EE5F5B',
            }
          },
          selectIcon: {
            class: 'folder_icon',
            style: {
              color: '#007AD5',
            },
            active: {
              class: 'folder_icon_active',
              style: {
                color: '#2ECC71',
              },
            }
          },
          text: {
            style: {},
            active: {
              style: {
                'font-weight': 'bold',
                color: '#2ECC71',
              }
            }
          }
        },
        options: {
          events: {
            expanded: {
              state: true,
              fn: this.toggleExpanded,
            },
            selected: {
              state: false,
              fn: this.toggleSelected,
            },
            checked: {
              state: false,
              fn: this.toggleChecked,
            },
            editableName: {
              state: false,
              fn: null,
              calledEvent: null,
            }
          },
          addNode: { state: false, fn: null, appearOnHover: false },
          editNode: { state: false, fn: null, appearOnHover: false },
          deleteNode: { state: false, fn: null, appearOnHover: false },
          showTags: false,
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
      this.copyOptions(this.customOptions, this.options);
      this.copyOptions(this.customStyles, this.styles);
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
        if (arrIds[arrIds.length - 1] == this.node.id) {
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
        if (arrIds[arrIds.length - 1] == this.node.id) {
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
        if (arrIds[arrIds.length - 1] != this.node.id) {
          this.expanded = true;
          this.$nextTick(function() {
            this.callSpecificChild(arrIds, 'callNodeExpanded', args);
          })
        } else {
          this.expanded = value;
        }
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
    }
  }

</script>


<style lang="scss" scoped>
  .tree-indent {
    margin: 0 10px;
    display: inline-block;
  }
  .small-tree-indent {
    margin: 0 3px;
    display: inline-block;
  }
  .icon-hover {
    visibility: hidden;
    opacity: 0;
    transition: all .2s ease-in-out;
  }
  .row_data:hover .icon-hover{
    visibility: visible;
    opacity: 1;
  }
  .capitalize {
    text-transform: capitalize;
  }
  .badge {
    font-size: 12px;
    font-weight: normal;
  }
  li {
    list-style: none;
  }
  .icon_margin {
    margin: 0 5px 0 0;
  }
  .icon_parent {
    background: transparent;
    width: 20px;
    height: 20px;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    margin: 0 2px 0 0;
    i {
      font-size: 16px;
      line-height: 10px;
    }
    &:last-child {
      margin: 0;
    }
  }
  .expanded_icon {
    font-size: 16px;
    transform: translateY(-5%) rotate(0deg);
    transition: all ease .2s;
    &.expanded {
      transform: translateY(-5%) rotate(90deg);
    }
  }
  .add_icon:before {
    content: '\002b';
  }
  .edit_icon:before {
    content: '\00270e';
  }
  .delete_icon:before {
    content: '\00d7';
  }
  .folder_icon:before {
    content: '\1F4C1';
  }
  .folder_icon_active:before {
    content: '\1F4C2';
  }
</style>