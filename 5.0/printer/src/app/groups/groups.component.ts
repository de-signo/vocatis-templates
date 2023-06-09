import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TopLevelItemModel } from "../services/app-data.model";
import { DataService } from "../services/data.service";

@Component({
  selector: "vpr-groups",
  templateUrl: "./groups.component.html",
  styleUrls: ["./groups.component.scss"],
})
export class GroupsComponent implements OnInit {
  groups: TopLevelItemModel[] = [];
  constructor(private data: DataService, private router: Router) {}

  ngOnInit(): void {
    this.data.groups.subscribe((data) => (this.groups = data));
  }

  selectGroup(g: TopLevelItemModel, index: number) {
    if (g.type == "appointment") {
      switch (g.mode) {
        case "id":
          this.router.navigate(["/enter-appoint-id"], {
            queryParamsHandling: "preserve",
          });
          break;
        case "scan":
          this.router.navigate(["/scan-appointment"], {
            queryParamsHandling: "preserve",
          });
          break;
      }
    } else {
      this.router.navigate(["/groups", index], {
        queryParamsHandling: "preserve",
      });
    }
  }
}
