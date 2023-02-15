import {App} from "cdktf";
import {Website} from "./common-constructs/website/Website";

export class PortfolioApp extends App {

    public constructor() {
        super();
        new Website(this, "Portfolio", {
            domainName: "nathancopier.com",
            soaEmail: "nfcopier@gmail.com"
        });
    }
}
