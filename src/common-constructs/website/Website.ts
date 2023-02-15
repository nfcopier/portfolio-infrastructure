import {TerraformStack} from "cdktf";
import {Construct} from "constructs";
import {LinodeCluster} from "./LinodeCluster";
import {NginxIngress} from "../kubernetes/NginxIngress";
import {DomainRecord} from "../../../.gen/providers/linode/domain-record";
import {KubeConfig} from "../kubernetes/KubeConfig";
import {Domain} from "../../../.gen/providers/linode/domain";

interface DomainConfig {
    domainName: string;
    soaEmail: string;
}

export class Website extends TerraformStack {

    private readonly cluster: LinodeCluster;

    public constructor(scope: Construct, label: string, domainConfig: DomainConfig) {
        super(scope, label.toLowerCase());
        this.cluster = new LinodeCluster(this, label);
        const ingress = new NginxIngress(this, this.cluster.kubeConfig);
        const domain = this.domain(domainConfig);
        this.nakedSubdomain(ingress, domain);
        this.wwwSubdomain(ingress, domain);
    }
    private domain(domainConfig: DomainConfig): Domain {
        return new Domain(this, "domain", {
            type: "master",
            domain: domainConfig.domainName,
            soaEmail: domainConfig.soaEmail
        });
    }

    private nakedSubdomain(ingress: NginxIngress, domain: Domain): void {
        new DomainRecord(this, "naked-domain", {
            recordType: "A",
            name: domain.domain,
            target: ingress.ipAddress,
            domainId: domain.getNumberAttribute("id"),
            ttlSec: 30
        });
    }

    private wwwSubdomain(ingress: NginxIngress, domain: Domain): void {
        new DomainRecord(this, "www-domain", {
            recordType: "A",
            name: "www",
            target: ingress.ipAddress,
            domainId: domain.getNumberAttribute("id"),
            ttlSec: 30
        });
    }

    public get kubeConfig(): KubeConfig {
        return this.cluster.kubeConfig;
    }
}
