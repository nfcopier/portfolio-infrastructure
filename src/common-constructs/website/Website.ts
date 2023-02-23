import {TerraformStack} from "cdktf";
import {Construct} from "constructs";
import {LinodeCluster} from "./LinodeCluster";
import {NginxIngress} from "../kubernetes/NginxIngress";
import {Namespace} from "@cdktf/provider-kubernetes/lib/namespace";
import {LinodeDomain} from "./LinodeDomain";
import {CertManager} from "../kubernetes/CertManager";

interface WebsiteConfig {
    domainName: string;
    soaEmail: string;
}

export class Website extends TerraformStack {

    private readonly websiteNamespace = "website-system";

    public constructor(scope: Construct, label: string, domainConfig: WebsiteConfig) {
        super(scope, label.toLowerCase());
        const cluster = new LinodeCluster(this, label);
        new Namespace(this, "website-namespace", {metadata: {name: this.websiteNamespace}, dependsOn: [cluster]});
        const ingress = new NginxIngress(this,{
            namespace: this.websiteNamespace,
            kubeConfig: cluster.kubeConfig
        });
        new LinodeDomain(this, {...domainConfig, ipAddress: ingress.ipAddress});
        new CertManager(this, {
            namespace: this.websiteNamespace,
            kubeConfig: cluster.kubeConfig,
            soaEmail: domainConfig.soaEmail
        });
    }
}
