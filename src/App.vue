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
          style: {
            width: '500px',
            cursor: 'pointer'
          },
          child: {
            style: {
              height: '35px'
            },
            active: {
              style: {
                height: '35px'
              }
            }
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
