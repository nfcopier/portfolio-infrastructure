import {Construct} from "constructs";
import {Release} from "@cdktf/provider-helm/lib/release";
import {
    DataKubernetesService,
    DataKubernetesServiceStatusLoadBalancerOutputReference
} from "@cdktf/provider-kubernetes/lib/data-kubernetes-service";
import {KubeProviderSet} from "../provider-sets/KubeProviderSet";
import {KubeConfig} from "./KubeConfig";

export class NginxIngress {

    private readonly kubeNamespace = "nginx-system";
    private readonly helmRepository = "https://kubernetes.github.io/ingress-nginx";

    private readonly loadBalancer: DataKubernetesServiceStatusLoadBalancerOutputReference;

    public constructor(scope: Construct, kubeConfig: KubeConfig) {
        new KubeProviderSet(scope, kubeConfig.path);
        const release = this.NginxRelease(scope, kubeConfig);
        const service = this.nginxService(scope, release);
        this.loadBalancer = service.status.get(0).loadBalancer.get(0);
    }

    private nginxService(scope: Construct, release: Release): DataKubernetesService {
        return new DataKubernetesService(scope, "service", {
            metadata: {
                name: "ingress-controller-ingress-nginx-controller",
                namespace: this.kubeNamespace
            },
            dependsOn: [release]
        });
    }

    private NginxRelease(scope: Construct, kubeConfig: KubeConfig): Release {
        return new Release(scope, "release", {
            name: "ingress-controller",
            namespace: this.kubeNamespace,
            repository: this.helmRepository,
            chart: "ingress-nginx",
            createNamespace: true,
            dependsOn: [kubeConfig]
        });
    }

    public get ipAddress(): string {
        return this.loadBalancer.ingress.get(0).ip;
    }
}
