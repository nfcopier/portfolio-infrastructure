import {Construct} from "constructs";
import {Release} from "@cdktf/provider-helm/lib/release";
import {
    DataKubernetesService,
    DataKubernetesServiceStatusLoadBalancerOutputReference
} from "@cdktf/provider-kubernetes/lib/data-kubernetes-service";
import {KubeConfig} from "./KubeConfig";

interface NginxIngressConfig {
    namespace: string;
    kubeConfig: KubeConfig;
}

export class NginxIngress extends Construct {

    private readonly kubeNamespace: string;
    private readonly helmRepository = "https://kubernetes.github.io/ingress-nginx";
    private readonly chart = "ingress-nginx";

    private readonly loadBalancer: DataKubernetesServiceStatusLoadBalancerOutputReference;

    public constructor(scope: Construct, config: NginxIngressConfig) {
        super(scope, "ingress-nginx");
        this.kubeNamespace = config.namespace;
        const release = this.Release(config.kubeConfig);
        const service = this.Service(release);
        this.loadBalancer = service.status.get(0).loadBalancer.get(0);
    }

    private Release(kubeConfig: KubeConfig): Release {
        return new Release(this, "release", {
            name: "ingress-controller",
            namespace: this.kubeNamespace,
            repository: this.helmRepository,
            chart: this.chart,
            atomic: true,
            dependsOn: [kubeConfig]
        });
    }

    private Service(release: Release): DataKubernetesService {
        return new DataKubernetesService(this, "service", {
            metadata: {
                name: "ingress-controller-ingress-nginx-controller",
                namespace: this.kubeNamespace
            },
            dependsOn: [release]
        });
    }

    public get ipAddress(): string {
        return this.loadBalancer.ingress.get(0).ip;
    }
}
