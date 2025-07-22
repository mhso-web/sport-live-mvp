import { UserRepository } from './repositories/userRepository'
import { AuthService } from './services/authService'

class Container {
  private static instance: Container
  private services = new Map<string, any>()

  private constructor() {
    this.registerRepositories()
    this.registerServices()
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container()
    }
    return Container.instance
  }

  private registerRepositories() {
    this.services.set('userRepository', new UserRepository())
  }

  private registerServices() {
    this.services.set('authService', new AuthService(
      this.get('userRepository')
    ))
  }

  get<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service ${name} not found`)
    }
    return service
  }
}

// Export singleton instances
const container = Container.getInstance()

export const authService = container.get<AuthService>('authService')
export const userRepository = container.get<UserRepository>('userRepository')