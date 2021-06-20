<template>
  <li
    class="node"
    :data-id="node.id"
    :style="styles.row.style">
    <div
      :class="['row_data', selected ? styles.row.child.active.class: styles.row.child.class]"
      :style="selected ? styles.row.child.active.style : styles.row.child.style"
      @click="toggleEvent('selected', node)">
      <span @click.stop="options.events.expanded.state == true && node.nodes != undefined && node.nodes.length > 0 && toggleEvent('expanded', node)">
        <i
          v-if="options.events.expanded.state == true && node.nodes != undefined && node.nodes.length > 0"
          :class="[{'expanded': expanded == true}, styles.expanded.class]">
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
        @click.stop="toggleEvent('checked', node)"
      >
      <span
        data-toggle="tooltip"
        data-placement="top"
        :title="node.definition"
        v-bind:class="[{'selected': selected}, styles.text.class]"
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
    <ul v-if="expanded" :style="styles.rowIndent">
      <tree-row
        v-for="child in node.nodes"
        :ref="'tree-row-' + child.id"
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
    customStyles: Object,
    parentNode: Object
  },
  data () {
    return {
      styles: {
        row: {
          style: {
            width: '500px',
            cursor: 'pointer'
          },
          child: {
            class: '',
            style: {
              height: '35px'
            },
            active: {
              class: '',
              style: {
                height: '35px'
              }
            }
          }
        },
        rowIndent: {
          paddingLeft: '20px'
        },
        expanded: {
          class: 'expanded_icon'
        },
        addNode: {
          class: 'add_icon',
          style: {
            color: '#007AD5'
          }
        },
        editNode: {
          class: 'edit_icon',
          style: {
            color: '#007AD5'
          }
        },
        deleteNode: {
          class: 'delete_icon',
          style: {
            color: '#EE5F5B'
          }
        },
        selectIcon: {
          class: 'folder_icon',
          style: {
            color: '#007AD5'
          },
          active: {
            class: 'folder_icon_active',
            style: {
              color: '#2ECC71'
            }
          }
        },
        text: {
          style: {},
          class: 'capitalize',
          active: {
            style: {
              'font-weight': 'bold',
              color: '#2ECC71'
            }
          }
        }
      },
      options: {
        events: {
          expanded: {
            state: true,
            fn: this.toggleExpanded
          },
          selected: {
            state: false,
            fn: this.toggleSelected
          },
          checked: {
            state: false,
            fn: this.toggleChecked
          },
          editableName: {
            state: false,
            fn: null,
            calledEvent: null
          }
        },
        addNode: { state: false, fn: null, appearOnHover: false },
        editNode: { state: false, fn: null, appearOnHover: false },
        deleteNode: { state: false, fn: null, appearOnHover: false },
        showTags: false
      },
      checked: false,
      expanded: false,
      selected: false
    }
  },
  watch: {
    checked () {
      this.node.state.checked = this.checked
    },
    expanded () {
      this.node.state.expanded = this.expanded
    },
    selected () {
      this.node.state.selected = this.selected
    }
  },
  mounted () {
    this.copyOptions(this.customOptions, this.options)
    this.copyOptions(this.customStyles, this.styles)
    if (this.node.checkable !== undefined) this.options.events.checked.state = this.node.checkable
    if (this.node.selectable !== undefined) this.options.events.selected.state = this.node.selectable
    if (this.node.expandable !== undefined) this.options.events.expanded.state = this.node.expandable

    const defaultState = { checked: false, expanded: false, selected: false }
    this.node.state = { ...defaultState, ...this.node.state }
    this.expanded = this.node.state.expanded
    this.selected = this.node.state.selected
    this.checked = this.node.state.checked
  },
  methods: {
    toggleEvent (eventType, node) {
      if (eventType === 'editableName' && this.options.events['editableName'].calledEvent) {
        this.toggleEvent(this.options.events['editableName'].calledEvent, node)
      } else if (this.options.events[eventType].state === true) {
        const fnName = this.options.events[eventType].fn
        fnName(node, this)
      }
    },
    toggleExpanded (node, instance) {
      this.expanded = !this.expanded
      this.node.state.expanded = this.expanded
      this.$nextTick(() => {
        this.$emit('emitNodeExpanded', node, this.expanded)
      })
    },
    toggleSelected (node, instance) {
      this.selected = !this.selected
      this.node.state.selected = this.selected
      this.$emit('emitNodeSelected', node)
    },
    toggleChecked (node, instance) {
      this.checked = !this.checked
      this.node.state.checked = this.checked
      this.$nextTick(() => {
        this.callNodesChecked(this.checked)
        this.$emit('emitNodeChecked', node)
      })
    },
    emitNodeSelected (nodeSelected) { // redirect the event toward the Tree component
      this.$emit('emitNodeSelected', nodeSelected)
    },
    emitNodeExpanded (node, state) { // redirect the event toward the Tree component
      this.$emit('emitNodeExpanded', node, state)
    },
    emitNodeChecked (nodeChecked) { // redirect the event toward the Tree component
      this.$emit('emitNodeChecked', nodeChecked)
    },
    recCallNodes (state, event, nodes) {
      const _this = this
      nodes.forEach((node) => {
        if (!node.state) node.state = { checked: false, expanded: false, selected: false }
        node.state[event] = state
        if (node.nodes) {
          _this.recCallNodes(state, event, node.nodes)
        }
      })
    },
    callNodesChecked (state) {
      this.checked = state
      for (let i = 0; i < this.$children.length; i++) {
        this.$children[i].callNodesChecked(state)
      }
      if (this.$children.length === 0 && this.node.nodes && this.node.nodes.length > 0) {
        this.recCallNodes(state, 'checked', this.node.nodes)
      }
    },
    callNodesDeselect () {
      this.selected = false
      this.node.state.selected = this.selected
      for (let i = 0; i < this.$children.length; i++) {
        this.$children[i].callNodesDeselect()
      }
      if (this.$children.length === 0 && this.node.nodes && this.node.nodes.length > 0) {
        this.recCallNodes(false, 'selected', this.node.nodes)
      }
    },
    callSpecificChild (arrIds, fname, args) {
      for (let i = 0; i < this.$children.length; i++) {
        let currentNodeId = this.$children[i].$props.node.id
        if (arrIds.find(x => x == currentNodeId)) {
          this.$children[i][fname](args)
          return false
        }
      }
    },
    callNodeChecked (args) {
      const arrIds = args.arrIds
      const value = args.value
      if (arrIds[arrIds.length - 1] == this.node.id) {
        this.checked = value
        this.callNodesChecked(this.checked)
      } else {
        this.expanded = true
        this.$nextTick(() => {
          this.callSpecificChild(arrIds, 'callNodeChecked', args)
        })
      }
    },
    callNodeSelected (args) {
      const arrIds = args.arrIds
      const value = args.value
      if (arrIds[arrIds.length - 1] == this.node.id) {
        this.selected = value
      } else {
        this.expanded = true
        this.$nextTick(() => {
          this.callSpecificChild(arrIds, 'callNodeSelected', args)
        })
      }
    },
    callNodeExpanded (args) {
      const arrIds = args.arrIds
      const value = args.value
      if (value === false && this.expanded === false) return
      if (arrIds[arrIds.length - 1] != this.node.id) {
        if (value === true) {
          this.expanded = true
          this.$nextTick(() => {
            this.callSpecificChild(arrIds, 'callNodeExpanded', args)
          })
        } else {
          this.callSpecificChild(arrIds, 'callNodeExpanded', args)
        }
      } else {
        this.expanded = value
      }
    },
    copyOptions (src, dst) {
      for (var key in src) {
        if (!dst[key]) {
          dst[key] = src[key]
        } else if (typeof (src[key]) === 'object') {
          this.copyOptions(src[key], dst[key])
        } else {
          dst[key] = src[key]
        }
      }
    }
  }
}

</script>

<style lang="scss" scoped>
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
  transform: rotate(0deg);
  transition: all ease .2s;
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 0 4px 8px;
  border-color: transparent transparent transparent #555;
  &.expanded {
    transform: rotate(90deg);
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
  content: '\1F5C0';
}
.folder_icon_active:before {
  content: '\1F5C1';
}
</style>
