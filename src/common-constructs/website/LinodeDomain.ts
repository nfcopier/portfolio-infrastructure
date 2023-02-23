import {Construct} from "constructs";
import {Domain} from "../../../.gen/providers/linode/domain";
import {DomainRecord} from "../../../.gen/providers/linode/domain-record";

interface LinodeDomainConfig {
    domainName: string;
    soaEmail: string;
    ipAddress: string;
}

export class LinodeDomain {

    private readonly scope: Construct;

    public constructor(scope: Construct, config: LinodeDomainConfig) {
        this.scope = scope;
        const domain = this.domain(config);
        this.nakedSubdomain(config.ipAddress, domain);
        this.wwwSubdomain(config.ipAddress, domain);
    }
    private domain(domainConfig: LinodeDomainConfig): Domain {
        return new Domain(this.scope, "domain", {
            type: "master",
            domain: domainConfig.domainName,
            soaEmail: domainConfig.soaEmail
        });
    }

    private nakedSubdomain(ipAddress: string, domain: Domain): void {
        new DomainRecord(this.scope, "naked-domain", {
            recordType: "A",
            name: domain.domain,
            target: ipAddress,
            domainId: domain.getNumberAttribute("id"),
            ttlSec: 30
        });
    }

    private wwwSubdomain(ipAddress: string, domain: Domain): void {
        new DomainRecord(this.scope, "www-domain", {
            recordType: "A",
            name: "www",
            target: ipAddress,
            domainId: domain.getNumberAttribute("id"),
            ttlSec: 30
        });
    }
}
