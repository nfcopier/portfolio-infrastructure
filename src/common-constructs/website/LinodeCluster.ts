import {Construct} from "constructs";
import {LkeCluster, LkeClusterConfig} from "../../../.gen/providers/linode/lke-cluster";
import {ITerraformDependable} from "cdktf";
import {KubeConfig} from "../kubernetes/KubeConfig";
import {WebsiteProviderSet} from "../provider-sets/WebsiteProviderSet";

export class LinodeCluster extends Construct implements ITerraformDependable {

    private readonly _fqn: string;
    private readonly _kubeConfig: KubeConfig;

    public constructor(scope: Construct, label: string) {
        super(scope, "lke-cluster-construct");
        new WebsiteProviderSet(this);
        const cluster = new LkeCluster(this, "lke-cluster", this.getConfig(label));
        this._fqn = cluster.fqn;
        this._kubeConfig = new KubeConfig(this, cluster.kubeconfig);
    }

    private getConfig(label: string): LkeClusterConfig {
        return {
            label,
            k8SVersion: "1.25",
            region: "us-west",
            pool: [{
                count: 1,
                type: "g6-standard-1"
            }]
        };
    }

    public get fqn(): string {
        return this._fqn;
    };

    public get kubeConfig(): KubeConfig {
        return this._kubeConfig;
    }
}
