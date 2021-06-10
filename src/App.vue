<template>
  <div id="app">
    <Tree
      ref="my-tree"
      :custom-options="myCustomOptions"
      :custom-styles="myCustomStyles"
      :nodes="treeDisplayData">
    </Tree>
  </div>
</template>

<script>
import Tree from './components/Tree.vue'

export default {
  name: 'app',
  components: {
    Tree
  },
  data () {
    return {
      treeDisplayData: [
        {
          text: 'Root 1',
          id: 1,
          checkable: false,
          nodes: [
            {
              text: 'Child 1',
              id: 3,
              state: {
                checked: true
              },
              nodes: [
                {
                  text: 'Grandchild 1',
                  id: 5
                },
                {
                  text: 'Grandchild 2',
                  id: 6
                }
              ]
            },
            {
              text: 'Child 2',
              id: 4
            }
          ]
        },
        {
          text: 'Root 2',
          id: 2
        }
      ]
    }
  },
  computed: {
    myCustomStyles () {
      return {
        tree: {
          height: 'auto',
          maxHeight: '300px',
          overflowY: 'visible',
          display: 'inline-block',
          textAlign: 'left'
        },
        row: {
          width: '500px',
          cursor: 'pointer',
          child: {
            height: '35px'
          }
        },
        text: {
          style: {},
          active: {
            style: {
              'font-weight': 'bold',
              color: '#2ECC71'
            }
          }
        }
      }
    },
    myCustomOptions () {
      return {
        treeEvents: {
          expanded: {
            state: false
          },
          collapsed: {
            state: false
          },
          selected: {
            state: false
          },
          checked: {
            state: true,
            fn: this.myCheckedFunction
          }
        },
        events: {
          expanded: {
            state: true
          },
          selected: {
            state: true
          },
          checked: {
            state: true
          },
          editableName: {
            state: true,
            calledEvent: 'expanded'
          }
        },
        addNode: {
          state: true,
          fn: this.addNodeFunction,
          appearOnHover: false
        },
        editNode: { state: false, fn: null, appearOnHover: false },
        deleteNode: {
          state: true,
          fn: this.deleteNodeFunction,
          appearOnHover: true
        },
        showTags: true
      }
    }
  },
  mounted () {
    this.getTreeVisibleNodes()
  },
  methods: {
    getTreeVisibleNodes () {
      console.log(`visible nodes: ${this.$refs['my-tree'].getVisibleNodes()}`)
    },
    getTree (treeId) {
      for (let i = 0; i < this.$children.length; i++) {
        if (this.$children[i].$props.id === treeId) return this.$children[i]
      }
    },
    myCheckedFunction (nodeId, state) {
      console.log(`is ${nodeId} selected ? ${state}`)
    },
    deleteNodeFunction (node) {
      console.log(`must remove ${node.id}`)
    },
    addNodeFunction (node) {
      console.log('add node function')
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
  content: '\1F4C1';
}
.folder_icon_active:before {
  content: '\1F4C2';
}
</style>
