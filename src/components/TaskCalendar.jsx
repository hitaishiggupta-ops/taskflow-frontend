import { Calendar, momentLocalizer }
from "react-big-calendar";

import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer =
momentLocalizer(moment);

export default function TaskCalendar({
tasks
}) {

const events =
tasks
.filter(task => task.dueDate)
.map(task => ({
title: task.title,
start: new Date(task.dueDate),
end: new Date(task.dueDate)
}));

return (

<div
className="bg-white p-5 rounded shadow"
style={{ height: 600 }}
>

<Calendar
localizer={localizer}
events={events}
startAccessor="start"
endAccessor="end"
/>

</div>

);

}