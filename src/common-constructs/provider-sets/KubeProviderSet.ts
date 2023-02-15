import {Construct} from "constructs";
import {KubernetesProvider} from "@cdktf/provider-kubernetes/lib/provider";
import {HelmProvider} from "@cdktf/provider-helm/lib/provider";

export class KubeProviderSet {

    public constructor(scope: Construct, configPath: string) {
        new KubernetesProvider(scope, "kubernetes-provider", {
            configPath: configPath
        });
        new HelmProvider(scope, "helm-provider", {
            kubernetes: {
                configPath: configPath
            }
        });
    }
}
