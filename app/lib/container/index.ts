/**
 * Dependency Injection Container
 * This provides a centralized way to manage service instances
 * and will make it easier to switch between internal and external APIs
 */

import { UserRepository } from '@/lib/repositories/userRepository'
import { PostRepository } from '@/lib/repositories/postRepository'
import { BoardCategoryRepository } from '@/lib/repositories/boardCategoryRepository'
import { PartnerRepository } from '@/lib/repositories/partnerRepository'
import { InquiryRepository } from '@/lib/repositories/inquiryRepository'

import { AuthService } from '@/lib/services/authService'
import { PostService } from '@/lib/services/postService'
import { UserService } from '@/lib/services/userService'
import { BoardService } from '@/lib/services/boardService'
import { PartnerService } from '@/lib/services/partnerService'
import { PartnerAdminService } from '@/lib/services/partnerAdminService'
import { BadgeService } from '@/lib/services/badgeService'
import { ExperienceService } from '@/lib/services/experienceService'

// Service registry type
type ServiceRegistry = {
  // Repositories
  userRepository: UserRepository
  postRepository: PostRepository
  boardCategoryRepository: BoardCategoryRepository
  partnerRepository: PartnerRepository
  inquiryRepository: InquiryRepository
  
  // Services
  authService: AuthService
  postService: PostService
  userService: UserService
  boardService: BoardService
  partnerService: PartnerService
  partnerAdminService: PartnerAdminService
  badgeService: BadgeService
  experienceService: ExperienceService
}

class DIContainer {
  private services: Partial<ServiceRegistry> = {}
  private factories: Map<keyof ServiceRegistry, () => any> = new Map()

  constructor() {
    this.registerFactories()
  }

  private registerFactories() {
    // Register repository factories
    this.factories.set('userRepository', () => new UserRepository())
    this.factories.set('postRepository', () => new PostRepository())
    this.factories.set('boardCategoryRepository', () => new BoardCategoryRepository())
    this.factories.set('partnerRepository', () => new PartnerRepository())
    this.factories.set('inquiryRepository', () => new InquiryRepository())
    
    // Register service factories with dependencies
    this.factories.set('authService', () => 
      new AuthService(this.get('userRepository'))
    )
    
    this.factories.set('postService', () => 
      new PostService(
        this.get('postRepository'),
        this.get('boardCategoryRepository'),
        this.get('userRepository')
      )
    )
    
    this.factories.set('userService', () => 
      new UserService(this.get('userRepository'))
    )
    
    this.factories.set('boardService', () => 
      new BoardService(this.get('boardCategoryRepository'))
    )
    
    this.factories.set('partnerService', () => 
      new PartnerService(this.get('partnerRepository'))
    )
    
    this.factories.set('partnerAdminService', () => 
      new PartnerAdminService(this.get('partnerRepository'))
    )
    
    this.factories.set('badgeService', () => new BadgeService())
    this.factories.set('experienceService', () => new ExperienceService())
  }

  /**
   * Get a service instance (singleton pattern)
   */
  get<K extends keyof ServiceRegistry>(serviceName: K): ServiceRegistry[K] {
    // Return existing instance if available
    if (this.services[serviceName]) {
      return this.services[serviceName] as ServiceRegistry[K]
    }

    // Create new instance using factory
    const factory = this.factories.get(serviceName)
    if (!factory) {
      throw new Error(`Service ${serviceName} not registered`)
    }

    const instance = factory()
    this.services[serviceName] = instance
    return instance
  }

  /**
   * Clear all service instances (useful for testing)
   */
  clear() {
    this.services = {}
  }

  /**
   * Register a custom service instance (useful for testing)
   */
  register<K extends keyof ServiceRegistry>(
    serviceName: K, 
    instance: ServiceRegistry[K]
  ) {
    this.services[serviceName] = instance
  }
}

// Export singleton instance
export const container = new DIContainer()

// Export convenient service getters
export const getAuthService = () => container.get('authService')
export const getPostService = () => container.get('postService')
export const getUserService = () => container.get('userService')
export const getBoardService = () => container.get('boardService')
export const getPartnerService = () => container.get('partnerService')
export const getPartnerAdminService = () => container.get('partnerAdminService')
export const getBadgeService = () => container.get('badgeService')
export const getExperienceService = () => container.get('experienceService')

// Export repository getters
export const getUserRepository = () => container.get('userRepository')
export const getPostRepository = () => container.get('postRepository')
export const getBoardCategoryRepository = () => container.get('boardCategoryRepository')
export const getPartnerRepository = () => container.get('partnerRepository')
export const getInquiryRepository = () => container.get('inquiryRepository')