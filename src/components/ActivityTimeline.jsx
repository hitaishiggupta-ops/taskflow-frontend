import { useEffect, useState } from "react";
import {
    FaPlusCircle,
    FaTrash,
    FaTasks,
    FaCheckCircle
} from "react-icons/fa";

import {
    getActivities as getActivitiesAPI
}
    from "../services/activityService";
export default function ActivityTimeline({ refresh }) {

    const [activities, setActivities] = useState([]);

    useEffect(() => {
        loadActivities();
    }, [refresh]);

    const loadActivities = async () => {
        try {
            const res =
                await getActivitiesAPI();
            setActivities(res.data);
        } catch (error) {
            console.log(error);
        }
    };
    const getIcon = (action) => {
        if (action.includes("Created"))
            return <FaPlusCircle color="#22c55e" />;
        if (action.includes("Deleted"))
            return <FaTrash color="#ef4444" />;
        if (action.includes("Completed"))
            return <FaCheckCircle color="#3b82f6" />;
        return <FaTasks color="#6366f1" />;
    };
    const timeAgo = (date) => {
        const diff =
            Math.floor(
                (new Date() - new Date(date))
                / 1000
            );
        if (diff < 60)
            return `${diff}s ago`;
        if (diff < 3600)
            return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400)
            return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };
    return (
        <div style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: "var(--card-r)",
            padding: 20,
            marginBottom: 24,
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20
            }}>
                <h2 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text)"
                }}>
                    Recent Activity
                </h2>
                <span style={{
                    fontSize: 12,
                    color: "var(--text-3)"
                }}>
                    Last 10 events
                </span>

            </div>
            {
                activities.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--text-3)"
                    }}>
                        No activity found
                    </div>

                ) : (

                    <div style={{
                        maxHeight: 300,
                        overflowY: "auto"
                    }}>
                        {
                            activities.map(activity => (

                                <div
                                    key={activity.id}
                                    style={{
                                        display: "flex",
                                        gap: 15,
                                        padding: "14px 0",
                                        borderBottom:
                                            "1px solid var(--border)"
                                    }}
                                >
                                    <div style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "50%",
                                        background:
                                            "var(--surface)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0
                                    }}>
                                        {
                                            getIcon(
                                                activity.action
                                            )
                                        }
                                    </div>

                                    <div style={{
                                        flex: 1
                                    }}>

                                        <div style={{
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color:
                                                "var(--text)"
                                        }}>
                                            {
                                                activity.action
                                            }
                                        </div>

                                        <div style={{
                                            fontSize: 12,
                                            color:
                                                "var(--text-3)",
                                            marginTop: 4
                                        }}>
                                            {
                                                timeAgo(
                                                    activity.createdAt
                                                )
                                            }
                                        </div>

                                    </div>

                                </div>

                            ))
                        }

                    </div>

                )
            }

        </div>
    );
}