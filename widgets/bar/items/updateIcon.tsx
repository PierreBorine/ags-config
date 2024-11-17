import { Variable } from "astal";
import { bind } from "astal";

const update = Variable("").poll(1800000, 'bash -c "~/Scripts/isUpdate.sh"');

export default () => <button
  className="update"
  tooltipText="A nixpkgs update is available"
  visible={bind(update).as(t => t == "true")}>
  <icon icon="software-update-available-symbolic" />
</button>
