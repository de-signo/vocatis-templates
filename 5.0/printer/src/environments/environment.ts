// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  groupsServiceUrl: "assets/testgroups.json",
  queueServiceUrl: "assets/testqueues.json",
  numberServiceUrl: "assets/testnum.json",
  appointmentsServiceUrl: "assets/testappts.json",
  enableMultilang: true,
  enableOpenClose: true,
  enableApp: true,
  appUrl: "http://localhost:4201/",
  idleTimeout: 100,
  appointmentTimeout: 100,
  showLogo: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
