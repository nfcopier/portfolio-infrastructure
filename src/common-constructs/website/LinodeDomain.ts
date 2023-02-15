import {Construct} from "constructs";
import {Domain} from "../../../.gen/providers/linode/domain";

interface LinodeDomainConfig {
    domain: string;
    email: string;
}

export class LinodeDomain extends Construct {

    public constructor(scope: Construct, config: LinodeDomainConfig) {
        super(scope, "domain-construct");
        new Domain(this, "domain", {
            type: "master",
            domain: config.domain,
            soaEmail: config.email,
            ttlSec: 30
        });
    }
}
