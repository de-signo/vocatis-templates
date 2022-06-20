import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { GroupModel } from "../services/app-data.model";
import { DataService } from "../services/data.service";

@Component({
  selector: "vpr-groups",
  templateUrl: "./groups.component.html",
  styleUrls: ["./groups.component.scss"],
})
export class GroupsComponent implements OnInit {
  groups: GroupModel[] = [];
  constructor(private data: DataService, private router: Router) {}

  ngOnInit(): void {
    this.data.groups.subscribe((data) => (this.groups = data));
  }

  selectGroup(g: GroupModel, index: number) {
    this.router.navigate(["/groups", index], {
      queryParamsHandling: "preserve",
    });
  }
}
