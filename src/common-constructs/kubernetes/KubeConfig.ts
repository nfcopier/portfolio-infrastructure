import {Construct} from "constructs";
import {SensitiveFile} from "@cdktf/provider-local/lib/sensitive-file";
import {ITerraformDependable} from "cdktf";

export class KubeConfig implements ITerraformDependable {

    private readonly _path: string;
    private readonly _contents: string;
    private readonly _fqn: string;

    public constructor(scope: Construct, contents: string) {
        const kubeFile = new SensitiveFile(scope, "kube-config", {
            filename: "kubeconfig.yaml",
            contentBase64: contents
        });
        this._contents = contents;
        this._path = kubeFile.filename;
        this._fqn = kubeFile.fqn;
    }

    public get path(): string {
        return this._path;
    }

    public get contents(): string {
        return this._contents;
    }

    public get fqn(): string {
        return this._fqn;
    }
}
