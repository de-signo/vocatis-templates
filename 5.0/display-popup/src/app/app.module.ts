import { registerLocaleData } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { LOCALE_ID, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import localeDe from "@angular/common/locales/de";
import { PopupComponent } from "./popup/popup.component";
import { TemplateBaseRefModule, TemplateModule } from "@isign/forms-templates";
import { ISignPlayerExtensionsModule } from "@isign/player-extensions";
import { VocatisApiModule } from "@isign/vocatis-api";
import { ISignServicesModule } from "@isign/isign-services";
import { environment } from "src/environments/environment";

registerLocaleData(localeDe);

@NgModule({
  declarations: [AppComponent, PopupComponent],
  bootstrap: [AppComponent],
  imports: [
    TemplateBaseRefModule.forRoot(),
    TemplateModule,
    ISignPlayerExtensionsModule,
    VocatisApiModule.withAutoSetup(),
    ISignServicesModule.forRoot(environment.wellKnownISignUrl),
    BrowserModule,
    RouterModule.forRoot([{ path: "**", component: AppComponent }]),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "de-DE" },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
