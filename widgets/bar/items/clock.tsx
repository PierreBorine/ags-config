import { Variable } from "astal";

const date = Variable("").poll(30000, 'date "+%e/%m/%Y"'); // 30s
const time = Variable("").poll(1000, 'date "+%H:%M"'); // 1s

export default () => {
    return <centerbox
        name="clock"
        vertical
        startWidget={<label label={time()} />}
        endWidget={<label label={date()} />}>
    </centerbox>
}
