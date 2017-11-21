<template>
  <li class="node" :data-id="node.id" :style="options.style.row" v-on:click.stop="toggleEvent('selected', node, 'node', $event)">
    <div style="height: 35px;">
      <span v-on:click.stop="options.events.expanded.state == true && node.nodes != undefined && node.nodes.length > 0 && toggleEvent('expanded', node)">
        <span v-for="count in depth" class="tree-indent"></span>
        <i v-if="options.events.expanded.state == true && node.nodes != undefined && node.nodes.length > 0" class="fa" v-bind:class="{'fa-caret-right': expanded == false, 'fa-caret-down': expanded == true}" aria-hidden="true"></i>
        <span v-else-if="options.events.expanded.state == true && node.nodes == undefined" class="small-tree-indent"></span>
      </span>
      <i v-if="options.events.selected.state == true" v-on:click.stop="toggleEvent('selected', node)" class="fa" v-bind:class="{[options.icon]: expanded == false, [options.selectedIcon]: expanded == true}" aria-hidden="true" :style="'color:' + (selected == false ? options.iconColor : options.selectedIconColor)"></i>
      <input type="checkbox" name="item[]" :data-id="node.id" :checked="checked" v-if="options.events.checked.state == true" v-on:click.stop="toggleEvent('checked', node)">
      <span data-toggle="tooltip" data-placement="top" :title="node.definition" class="capitalize" v-bind:class="{'selected': selected}" :style="options.colorNameWhenSelected && selected ? ('color:' + options.selectedIconColor + '; font-weight: bold') : ''" v-on:click.stop="options.events.editableName.state && toggleEvent('editableName', node)" >{{ node.text }}</span>
      <span v-if="options.addNodes.state == true" v-on:click='options.addNodes.fn(node)'>
        <i :class="'fa ' + options.addElemIcon" :style="'color:' + options.addElemIconColor" aria-hidden="true"></i>
      </span>
      <span v-if="options.showTags == true">
        <span v-if="node.tags[0] != undefined && node.tags[0]!= null && node.tags[0]" class="badge">{{ node.tags[0] }}</span>
      </span>
    </div>
    <ul v-if="expanded">
      <template v-for="child in node.nodes">
        <tree-row :node="child" :depth="depth + 1" :custom_options="custom_options" :parent_node="node" v-on:emitNodeSelected="emitNodeSelected" v-on:emitNodeExpanded="emitNodeExpanded" v-on:emitNodeChecked="emitNodeChecked"></tree-row>
      </template>
    </ul>
  </li>
</template>

<script type="text/javascript">
  export default {
    name: 'tree-row',
    props: {
      node: Object,
      depth: Number,
      custom_options: Object,
      parent_node: Object
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
              calledEvent: null,
            }
          },
          style: {
            row: 'width: 500px;cursor: pointer;'
          },
          addNodes: {state: false, fn: null},
          showTags: false,
          colorNameWhenSelected: true,
          titleSelectable: true,
        },
        checked: false,
        expanded: false,
        selected: false
      }
    },
    watch: {
      checked: function() {
        this.node.state.checked = this.checked
      },
      expanded: function() {
        this.node.state.expanded = this.expanded
      },
      selected: function() {
        this.node.state.selected = this.selected
      }
    },
    mounted: function() {
      this.init_events()
      if (this.node.checked != undefined && this.node.checked == false) {
        this.checked = false
        this.node.state.checked = this.checked
      } else if (this.parent_node.state.checked) {
        this.checked = this.parent_node.state.checked
        this.node.state.checked = this.checked
      } else {
        this.checked = false
        this.node.state.checked = this.checked
      }

      if (this.node.state.expanded == undefined) {
        this.expanded = false
        this.node.state.expanded = this.expanded
      }
      if (this.node.state.expanded == true) {
        this.expanded = this.node.state.expanded
      }

      if (this.node.state.selected == undefined) {
        this.selected = false
        this.node.state.selected = this.selected
      }
      if (this.node.state.selected == true) {
        this.selected = this.node.state.selected
      }
    },
    methods: {
      toggleEvent: function(event_type, node, class_needed, event) {
        if (event_type == 'editableName' && this.options.events['editableName'].calledEvent) {
          this.toogleEvent(this.options.events['editableName'].calledEvent, node, class_needed, event)
        } else if (this.options.events[event_type].state == true) {
          var fn_name = this.options.events[event_type].fn
          fn_name(node, this);
        }
      },
      toggleExpanded: function(node, instance) {
        this.expanded = !this.expanded
        this.node.state.expanded = this.expanded
        this.$nextTick(function() {
          this.$emit('emitNodeExpanded', node, this.expanded);
        })
      },
      toggleSelected: function(node, instance) {
        this.selected = !this.selected
        this.node.state.selected = this.selected
        this.$emit('nodeSelected', node);
      },
      toggleChecked: function(node, instance) {
        this.checked = !this.checked
        this.node.state.checked = this.checked
        this.$nextTick(function() {
          this.callNodesChecked(this.checked)
          this.$emit('emitNodeChecked', node);
        })
      },
      editableName: function(node, instance) {
        var _this = this
        var name = prompt('Choose a new name', '')
        if (name) {
          $.ajax({
            url: '/taxonomies/edit_category_name',
            method: 'POST',
            data: {
              category: {
                id: _this.node.id,
                name: name
              }
            },
            success: function() {
              _this.node.name = name
            }
          })
        }
      },
      emitNodeSelected: function(node_selected) { // redirect the event toward the Tree component
        this.$emit('emitNodeSelected', node_selected);
      },
      emitNodeExpanded: function(node, state) { // redirect the event toward the Tree component
        this.$emit('emitNodeExpanded', node, state);
      },
      emitNodeChecked: function(node_checked) { // redirect the event toward the Tree component
        this.$emit('emitNodeChecked', node_checked);
      },
      callNodesChecked: function(state) {
        this.checked = state
        for (var i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesChecked(state)
        }
      },
      callNodesUnselect: function() {
        this.selected = false
        this.node.state.selected = this.selected
        for (var i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesUnselect()
        }
      },
      callSpecificChild: function(arr_ids, fname, args) {
        for (var i = 0; i < this.$children.length; i++) {
          var current_node_id = this.$children[i].$props.node.id
          if (arr_ids.find(x => x == current_node_id)) {
            this.$children[i][fname](args)
            return false
          }
        }
      },
      callNodeChecked: function(args) {
        var arr_ids = args.arr_ids
        var value = args.value
        if (arr_ids.last() == this.node.id) {
          this.checked = value
          this.callNodesChecked(this.checked)
        } else {
          this.expanded = true
          this.$nextTick(function() {
            this.callSpecificChild(arr_ids, 'callNodeChecked', args)
          })
        }
      },
      callNodeSelected: function(args) {
        var arr_ids = args.arr_ids
        var value = args.value
        if (arr_ids.last() == this.node.id) {
          this.selected = value
        } else {
          this.expanded = true
          this.$nextTick(function() {
            this.callSpecificChild(arr_ids, 'callNodeSelected', args)
          })
        }
      },
      callNodesExpanded: function(state) {
        if (!(this.node.text == 'All' && state != true)) {
          this.expanded = state
        }
        for (var i = 0; i < this.$children.length; i++) {
          this.$children[i].callNodesExpanded(state)
        }
      },
      callNodeExpanded: function(args) {
        var arr_ids = args.arr_ids
        var value = args.value
        if (value == false && this.expanded == false) return;
        if (arr_ids.last() != this.node.id) {
          this.expanded = true
          this.$nextTick(function() {
            this.callSpecificChild(arr_ids, 'callNodeExpanded', args)
          })
        } else {
          this.expanded = value
        }
      },
      init_events: function() {
        this.node.depth = this.depth
        if (this.custom_options) {
          if (this.custom_options.events) {
            var events = this.custom_options.events
            if (events.expanded) {
              if (events.expanded.state != undefined) this.options.events.expanded.state = events.expanded.state
              if (events.expanded.fn) this.options.events.expanded.fn = events.expanded.fn
            }
            if (events.selected) {
              if (events.selected.state != undefined) this.options.events.selected.state = events.selected.state
              if (events.selected.fn) this.options.events.selected.fn = events.selected.fn
            }
            if (events.checked) {
              if (events.checked.state != undefined) this.options.events.checked.state = events.checked.state          
              if (events.checked.fn) this.options.events.checked.fn = events.checked.fn
            }
            if (events.editableName) {
              if (events.editableName.state != undefined) this.options.events.editableName.state = events.editableName.state
              if (events.editableName.fn) this.options.events.editableName.fn = events.editableName.fn
              if (events.editableName.calledEvent) this.options.events.editableName.calledEvent = events.editableName.calledEvent
            }
          }
          if (this.node.checkable != undefined) {
            this.options.events.checked.state = this.node.checkable
          }
          if (this.custom_options.style && this.custom_options.style.row) {
            this.options.style.row = this.custom_options.style.row
          }
          if (this.custom_options.icon) {
            this.options.icon = this.custom_options.icon
          }
          if (this.custom_options.iconColor) {
            this.options.iconColor = this.custom_options.iconColor
          }
          if (this.custom_options.selectedIcon) {
            this.options.selectedIcon = this.custom_options.selectedIcon
          }
          if (this.custom_options.selectedIconColor) {
            this.options.selectedIconColor = this.custom_options.selectedIconColor
          }
          if (this.custom_options.addElemIcon) {
            this.options.addElemIcon = this.custom_options.addElemIcon
          }
          if (this.custom_options.addElemIconColor) {
            this.options.addElemIconColor = this.custom_options.addElemIconColor
          }
          if (this.custom_options.addNodes && this.custom_options.addNodes.state == true) {
            this.options.addNodes.state = true
            this.options.addNodes.fn = this.custom_options.addNodes.fn
          }
          if (this.custom_options.showTags) {
            this.options.showTags = this.custom_options.showTags
          }
          if (this.custom_options.colorNameWhenSelected) {
            this.options.colorNameWhenSelected = this.custom_options.colorNameWhenSelected
          }
          if (this.custom_options.titleSelectable) {
            this.options.titleSelectable = this.custom_options.titleSelectable
          }
        }
      }
    }
  }

</script>


<style lang="scss">
.tree-indent {
  margin-left: 10px;
  margin-right: 10px;
  display: inline-block;
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

