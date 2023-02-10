import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({ name: "selectLang", pure: false })
export class SelectLangPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(text: string | { [key: string]: string }): string {
    if (typeof text === "string") {
      return text;
    } else {
      const lang = this.translate.currentLang;
      // match
      if (lang in text) return text[lang];

      const keys = Object.keys(text);

      // empty object
      if (!keys || !keys.length) return "";

      // use default
      return text[keys[0]];
    }
  }
}
