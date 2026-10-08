import{createNavigationForSurface,assertNavigationRegistry}from'../product/navigation/NavigationRegistry.js';

export const BROKER_NAVIGATION=createNavigationForSurface('broker');

export function assertBrokerNavigation(){
  return assertNavigationRegistry(BROKER_NAVIGATION);
}
