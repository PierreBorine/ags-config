import { createPoll } from "ags/time";

const date = createPoll("", 30000, 'date "+%e/%m/%Y"'); // 30s
const time = createPoll("", 1000, 'date "+%H:%M"'); // 1s

export default () => {
    return <centerbox
        name="clock"
        vertical>
        <label $type="start" label={time} />
        <label $type="end" label={date} />
    </centerbox>
}
