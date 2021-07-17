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
        :checked="node.state.checked"
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
    <ul v-if="expanded && node.nodes" :style="styles.rowIndent">
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

<script lang="ts">
import { reactive } from 'vue'
import { Options, Vue } from 'vue-class-component'
import { NodeData, TreeRowCustomStyles, TreeRowCustomOptions } from './interface'
import { copyOptions, recCallNodes } from '@/components/helper'

@Options({
  props: {
    customOptions: Object,
    customStyles: Object,
    node: Object,
    parentNode: Object,
    depth: Number
  }
})

export default class Tree extends Vue {
  customOptions!: TreeRowCustomOptions
  customStyles!: TreeRowCustomStyles
  node!: NodeData
  parentNode!: NodeData
  depth!: number

  styles: TreeRowCustomStyles = reactive({
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
  })

  options: TreeRowCustomOptions = reactive({
    events: {
      expanded: {
        state: true,
        fn: null
      },
      selected: {
        state: false,
        fn: null
      },
      checked: {
        state: false,
        fn: null
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
  })

  get selected (): boolean {
    return this.node.state.selected
  }

  get expanded (): boolean {
    return this.node.state.expanded
  }

  mounted () {
    copyOptions(this.customOptions, this.options)
    copyOptions(this.customStyles, this.styles)
    if (this.node.checkable !== undefined) this.options.events.checked.state = this.node.checkable
    if (this.node.selectable !== undefined) this.options.events.selected.state = this.node.selectable
    if (this.node.expandable !== undefined) this.options.events.expanded.state = this.node.expandable
  }

  // Handle TreeRow events
  toggleEvent (eventType: string, node: NodeData) {
    const event = (this.options.events as any)[eventType]
    if (eventType === 'editableName' && event.calledEvent) {
      this.toggleEvent(event.calledEvent, node)
    } else if (event.state === true) {
      const fnName = event.fn || this.defaultEventFn(eventType)
      if (fnName) { fnName(node, this) }
    }
  }

  // Default functions for TreeRow event, can be overwritten in CustomOptions
  defaultEventFn (eventType: string): any {
    if (eventType === 'expanded') {
      return this.toggleExpanded
    } else if (eventType === 'selected') {
      return this.toggleSelected
    } else if (eventType === 'checked') {
      return this.toggleChecked
    }

    return null
  }

  // Default tree behavior when node is expanded
  toggleExpanded (node: NodeData) {
    this.node.state.expanded = !this.node.state.expanded
    this.emitNodeExpanded(node, this.node.state.expanded)
  }

  // Default tree behavior when node is selected
  toggleSelected (node: NodeData) {
    this.node.state.selected = !this.node.state.selected
    this.emitNodeSelected(node)
  }

  // Default tree behavior when node is checked
  toggleChecked (node: NodeData) {
    const state = !this.node.state.checked
    this.node.state.checked = state
    recCallNodes(state, 'checked', this.node.nodes)
    this.$emit('emitNodeChecked', node)
    this.emitNodeChecked(node)
  }

  // Redirect the event toward the Tree component
  emitNodeSelected (nodeSelected: NodeData) {
    this.$emit('emitNodeSelected', nodeSelected)
  }

  // Redirect the event toward the Tree component
  emitNodeExpanded (node: NodeData, state: boolean) {
    this.$emit('emitNodeExpanded', node, state)
  }

  // Redirect the event toward the Tree component
  emitNodeChecked (nodeChecked: NodeData) {
    this.$emit('emitNodeChecked', nodeChecked)
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
