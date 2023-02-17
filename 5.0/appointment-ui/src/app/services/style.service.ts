import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class StyleService {
  postponeOffset?: Number;
  planToQueue: { [key: string]: { queue: string; categories: string[] } } = {};

  constructor(route: ActivatedRoute) {
    route.queryParams.subscribe((params) => {
      const pp = params["s/pp"];
      this.postponeOffset =
        !pp && pp != "0" && pp != 0 ? undefined : 1000 * parseInt(pp);

      // read plan / queue map
      const apt_cats = params["s/ap_cat"] ?? [];
      let i = 1;
      let p2q = {} as {
        [key: string]: { queue: string; categories: string[] };
      };
      while (true) {
        let pn = params["s/ap_pn" + i];
        let qi = params["s/ap_qi" + i];
        if (!pn && !qi) break;
        p2q[pn] = { queue: qi, categories: apt_cats };
        i++;
      }
      this.planToQueue = p2q;
    });
  }
}
