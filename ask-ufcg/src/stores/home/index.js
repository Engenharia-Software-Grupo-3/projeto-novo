import { action, observable, runInAction } from 'mobx'
import DadosEstaticosService from '../../utils/dadosEstaticosService'
import { showErrorApiNotification } from '../../utils/notification'
import imagePic from '../../assets/perfil_not_found.png'
import imageNotFound from '../../assets/link_not_valid.jpg'

class HomeIndexStore {
  @observable object = null
  @observable loading = false
  @observable allAsks = []
  @observable allAsksForCards = []
  LENGTH_MAX = 60

  constructor(entity, service, entityName) {
    this.entity = entity
    this.service = service
    this.entityName = entityName
  }

  @action
  updateAttributeDecoratorKeyEventValue = (key, event) => {
    this.object[key] = event.target.value
  }

  @action
  updateAttributeDecoratorKeyValue = (key, value) => {
    this.object[key] = value
  }

  @action
  init = () => {
    this.object = new this.entity()
    this.loadAllAsks()
  }

  _checkImgOnline = (imageUrl) => {
    var img = new Image()
    img.src = imageUrl
    return img.height > 0
  }

  @action
  loadAllAsks = () => {
    this.loading = true
    this.service
      .getAllAsks()
      .then((response) => {
        runInAction(`Load All Asks`, () => {
          const content = response && response.data && response.data ? response.data : []
          if (content.length > 0) {
            this.allAsks = content
            this.allAsksForCards = content.map((ask) => {
              const askTitle = ask.title
                ? ask.title.length >= this.LENGTH_MAX
                  ? ask.title.substring(0, this.LENGTH_MAX)
                  : ask.title
                : ''
              const askDescription = ask.content
                ? ask.content.length >= this.LENGTH_MAX
                  ? ask.content.substring(0, this.LENGTH_MAX)
                  : ask.content
                : ''
              const tags = ask.tags ?? []
              const askTags = tags.map((item) => {
                let result = undefined
                DadosEstaticosService.getLabelsDisciplinas().forEach((disciplina) => {
                  if (disciplina.value === item) {
                    result = disciplina.label
                  }
                })
                return result
              })
              const linkAvatar =
                !ask.author.linkAvatar || this._checkImgOnline(ask.author.linkAvatar)
                  ? ask.author.linkAvatar || imagePic
                  : imageNotFound

              return {
                userphoto: linkAvatar,
                username: ask.author.firstName,
                title: askTitle,
                description: askDescription,
                tags: askTags,
              }
            })
          }
          this.loading = false
        })
      })
      .catch((error) => {
        runInAction(`Error on load All Asks`, () => {
          this.loading = false
          showErrorApiNotification(error)
        })
      })
  }
}

export default HomeIndexStore
