import React, { useState, useEffect } from 'react';
import { roadmapApi } from '../../services/api/roadmapApi';
import { Progress } from '../ui/Progress'; // Assuming a Progress component exists
import { Checkbox } from '../ui/Checkbox'; // Assuming a Checkbox component exists
import { toast } from 'react-toastify'; // Assuming react-toastify for notifications

const ActiveRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      // Change getCurrentRoadmap -> getActiveRoadmap
      const data = await roadmapApi.getActiveRoadmap();
      setRoadmap(data);
    } catch (err) {
      setError(err);
      toast.error("Failed to load roadmap.");
    } finally {
      setLoading(false);
    }
  };
  
const handleTaskCompletionToggle = async (taskId) => {
    try {
      // Optimistic update logic remains same...
      
      // Change completeTask -> toggleTaskComplete
      await roadmapApi.toggleTaskComplete(taskId);
      toast.success("Task updated!");
    } catch (err) {
      toast.error("Failed to update task status.");
      fetchRoadmap(); // Revert on failure
    }
  };

  const calculateProgress = (currentRoadmap) => {
    if (!currentRoadmap || !currentRoadmap.phases) return currentRoadmap;

    let totalTasks = 0;
    let completedTasks = 0;

    const updatedPhases = currentRoadmap.phases.map((phase) => {
      const phaseTasks = phase.tasks || [];
      const completedPhaseTasks = phaseTasks.filter((task) => task.status === 'Completed').length;
      const phaseProgress = phaseTasks.length > 0 ? (completedPhaseTasks / phaseTasks.length) * 100 : 0;

      totalTasks += phaseTasks.length;
      completedTasks += completedPhaseTasks;

      return { ...phase, progress_percentage: phaseProgress, status: phaseProgress === 100 ? 'Completed' : phase.status };
    });

    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return { ...currentRoadmap, phases: updatedPhases, progress_percentage: overallProgress, status: overallProgress === 100 ? 'Completed' : currentRoadmap.status };
  };

  if (loading) return <div>Loading roadmap...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!roadmap) return <div>No active roadmap found.</div>;

  return (
    <div className="active-roadmap-container">
      <h2>Your Active Career Journey</h2>
      <div className="progress-bar-section">
        <h3>Overall Progress: {roadmap.progress_percentage.toFixed(0)}%</h3>
        <Progress value={roadmap.progress_percentage} />
      </div>

      <div className="roadmap-phases">
        {roadmap.phases.map((phase) => (
          <div key={phase.id} className="phase-card bg-gray-800 p-4 rounded-lg mb-4">
            <h4 className="text-xl font-semibold mb-2">{phase.title} ({phase.progress_percentage.toFixed(0)}% Complete)</h4>
            <Progress value={phase.progress_percentage} />
            <p className="text-gray-400 mt-2">Status: {phase.status}</p>
            <div className="phase-tasks mt-4">
              {phase.tasks.map((task) => (
                <div key={task.id} className="task-item flex items-center mb-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.status === 'Completed'}
                    onCheckedChange={() => handleTaskCompletionToggle(task.id)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`text-lg ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-white'}`}
                  >
                    {task.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveRoadmap;
