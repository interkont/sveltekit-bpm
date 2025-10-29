<script lang="ts">
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher, onMount } from 'svelte';
    import { taskDetailStore } from '$lib/stores/taskDetailStore';
    import { taskListStore } from '$lib/stores/taskListStore';
    import { modal } from '$lib/stores/modal';
    import Icon from '$lib/components/Icon.svelte';
    import { taskService } from '$lib/services/taskService';
    import { toast } from '$lib/stores/toast';
    import type { Task, ProcessInstance, BusinessDataItem, GeneralInfoItem, TimelineStep, TimelineStatus, Comment, DocumentGroup, ProcessTaskInstance } from '$lib/types';
    import { _ } from 'svelte-i18n';

    let activeTab: 'form' | 'details' = 'form';
    let selectedAction: string = '';
    let comments: string = '';
    let formData: Record<string, any> = {};
    let isSubmitting = false;
    let actionOptions: string[] = [];

    // --- Reactive variables derived from the store state ---
    $: task = $taskDetailStore.task;
    $: processInstance = $taskDetailStore.processInstance;
    $: formDefinition = $taskDetailStore.formDefinition;
    $: generalInfo = processInstance ? mapGeneralInfo(processInstance) : [];
    $: timeline = processInstance ? mapTimeline(processInstance) : [];
    $: commentsData = processInstance ? mapComments(processInstance.taskInstances) : [];
    // --- NEW: Reactive variable for comments on the form tab, including task names ---
    $: formCommentsData = processInstance ? mapFormComments(processInstance.taskInstances) : [];
    $: documentsData = [] as DocumentGroup[];

    // When the form definition loads, initialize the formData for editable fields
    $: if (formDefinition?.fields) {
        formData = {};
        formDefinition.fields.forEach(field => {
            if (!field.validations.isReadonly) {
            formData[field.name] = field.value ?? '';
            }
        });
    }
    // When the actions load, set them up and select the first one by default.

    $: if (formDefinition?.actions) {
        actionOptions = [...formDefinition.actions];
        if (actionOptions.length > 0 && (!selectedAction || !actionOptions.includes(selectedAction))) {
            selectedAction = actionOptions[0];
        }
    }

    // --- FIX: Reactive statement to check form validity ---
    $: isFormInvalid = formDefinition?.fields.some(field =>
        field.validations?.isRequired && !field.validations?.isReadonly && (formData[field.name] === null || formData[field.name] === undefined || formData[field.name] === '')
    ) ?? true;


    function mapGeneralInfo(instance: ProcessInstance): GeneralInfoItem[] {
        return [
            { label: $_('process_detail.requested_by'), value: instance.startedByUser.fullName, icon: 'user' },
            { label: $_('process_detail.requester_email'), value: instance.startedByUser.email, icon: 'at-sign' },
            { label: $_('process_detail.start_date'), value: new Date(instance.startTime).toLocaleString(), icon: 'calendar' },
            { label: $_('process_detail.current_status'), value: instance.status, icon: 'activity' },
        ];
    }

    function mapTimeline(instance: ProcessInstance): TimelineStep[] {
        if (!instance?.taskInstances) return [];
        const sortedTasks = [...instance.taskInstances].sort((a, b) => b.id - a.id);
        const mappedSteps = sortedTasks.map(t => ({
            taskName: t.processElement.name,
            status: (t.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING') as TimelineStatus,
            user: t.completedByUser?.fullName || $_('process_detail.not_applicable'),
            date: t.completionTime ? new Date(t.completionTime).toLocaleString() : null,
        }));
        mappedSteps.push({
          taskName: $_('process_detail.process_start'),
          status: 'COMPLETED',
          user: instance.startedByUser.fullName,
          date: new Date(instance.startTime).toLocaleString()
        });
        return mappedSteps;
    }
    
    function mapComments(tasks: ProcessTaskInstance[]): Comment[] {
        if (!tasks) return [];
        return tasks
            .filter(task => typeof task.comments === 'string' && task.comments.trim() !== '')
            .map(task => ({
                user: task.completedByUser?.fullName || $_('process_detail.system_user'),
                text: task.comments || '',
                date: new Date(task.completionTime || task.createdAt).toLocaleString(),
                avatar: (task.completedByUser?.fullName || 'SYS').substring(0, 2).toUpperCase()
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // --- NEW: Function to map comments for the form tab, including the task name ---
    function mapFormComments(tasks: ProcessTaskInstance[]): any[] {
        if (!tasks) return [];
        return tasks
            .filter(task => typeof task.comments === 'string' && task.comments.trim() !== '')
            .map(task => ({
                user: task.completedByUser?.fullName || $_('process_detail.system_user'),
                text: task.comments || '',
                date: new Date(task.completionTime || task.createdAt).toLocaleString(),
                taskName: task.processElement.name
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  
    async function handleSubmit() {
        if (!task || !formDefinition) return;
        isSubmitting = true;
        try {
            const payload = {
                action: selectedAction,
                comments: comments,
                formData: formData
            };
            await taskService.completeTask(task.taskId, payload);
            toast.show(`${$_('concepts.task_singular')} "${task.taskName}" completada.`, 'success');
            taskDetailStore.hide();
            taskListStore.fetchTasks(); // Refresh the task list
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            toast.show(message, 'error');
        } finally {
            isSubmitting = false;
        }
    }

    function confirmAndSubmit() {
        if (!task) return;
        modal.show({
            title: $_('task_detail.confirm_action_title', { values: { action: selectedAction } }),
            message: $_('task_detail.confirm_action_message'),
            onConfirm: handleSubmit
        });
    }

    $: executedTimeline = timeline.filter(step => step.status === 'COMPLETED' || step.status === 'IN_PROGRESS');
    $: totalSteps = timeline.length;
    $: currentStepNumber = executedTimeline.length;

    function getStatusIcon(status: TimelineStatus): { name: string; color: string } {
        if (status === 'COMPLETED') return { name: 'check-circle', color: 'white' };
        if (status === 'PENDING') return { name: 'loader', color: 'var(--accent-color)' };
        return { name: 'circle', color: 'var(--text-secondary)' };
    }
</script>

{#if $taskDetailStore.isOpen}
  <div class="panel-backdrop" on:click={taskDetailStore.hide}></div>
  
  <aside class="detail-panel task-panel" transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      {#if task}
        <div>
          <span class="header-subtitle">{$_('task_detail.managing_task')} {$_('task_detail.id_label')}: {task.taskId}</span>
          <h2 title={task.taskName}>{task.taskName}</h2>
          <p>{$_('task_detail.of_process')}: {task.processName} ({$_('concepts.instance_singular')} {$_('task_detail.id_label')}: {task.processInstanceId})</p>
        </div>
      {/if}
      <button class="close-btn" on:click={taskDetailStore.hide} title={$_('process_detail.close_panel')}>
        <Icon name="x" size={28}/>
      </button>
    </header>

    <div class="tab-header-tasks">
      <button class:active={activeTab === 'form'} on:click={() => activeTab = 'form'}>
        <Icon name="edit-3" size={16}/> {$_('task_detail.task_form_tab')}
      </button>
      <button class:active={activeTab === 'details'} on:click={() => activeTab = 'details'}>
        <Icon name="file-search" size={16}/> {$_('task_detail.process_details_tab')}
      </button>
    </div>

    <div class="panel-content-full">
        {#if $taskDetailStore.loading}
            <div class="state-placeholder"><Icon name="loader" size={32} spinning={true} /><p>{$_('process_detail.loading')}</p></div>
        {:else if $taskDetailStore.error}
            <div class="state-placeholder error"><Icon name="alert-triangle" size={32} /><p>{$_('process_detail.error')}: {$taskDetailStore.error}</p></div>
        {:else if processInstance && formDefinition}
            {#if activeTab === 'form'}
                <div class="form-content">
                    <!-- Columna Izquierda: Formulario Dinámico -->
                    <div id="formdefinition">
                        <div class="dynamic-form">
                            <h3><Icon name="file-text" size={18}/> {$_('task_detail.form_title')}</h3>
                            {#each formDefinition.fields as field (field.name)}
                                <div class="form-field">
                                    <label for={field.name}>
                                    {field.label}
                                    {#if field.validations?.isRequired && !field.validations?.isReadonly}<span class="required-star">*</span>{/if}
                                    </label>
                                    
                                    {#if field.validations?.isReadonly}
                                        <div class="value-box">{field.value}</div>
                                    {:else if field.fieldType === 'NUMBER'}
                                        <input type="number" id={field.name} bind:value={formData[field.name]} required={field.validations?.isRequired} />
                                    {:else if field.fieldType === 'TEXTAREA'}
                                        <textarea id={field.name} rows="4" bind:value={formData[field.name]} required={field.validations?.isRequired}></textarea>
                                    {:else if field.fieldType === 'DATE'}
                                        <input type="date" id={field.name} bind:value={formData[field.name]} required={field.validations?.isRequired} />
                                    {:else}
                                        <input type="text" id={field.name} bind:value={formData[field.name]} required={field.validations?.isRequired} />
                                    {/if}
                                </div>
                            {/each}
                        </div>
                        <div class="action-section">
                            <h3><Icon name="check-square" size={18}/> {$_('task_detail.complete_task_title')}</h3>
                            <div class="form-field">
                              <label for="action-select">{$_('task_detail.select_action_label')}</label>
                              <select id="action-select" bind:value={selectedAction}>
                                {#each actionOptions as action}
                                    <option value={action}>{action}</option>
                                {/each}
                              </select>
                            </div>
                            <div class="form-field">
                              <label for="comments-textarea">{$_('task_detail.comments_label')}</label>
                              <textarea id="comments-textarea" rows="4" placeholder={$_('task_detail.comments_placeholder')} bind:value={comments}></textarea>
                            </div>
                            <div class="form-actions">
                              <button class="cancel-btn" on:click={taskDetailStore.hide}>{$_('task_detail.cancel_button')}</button>
                              <button class="submit-btn" on:click={confirmAndSubmit} disabled={isSubmitting || isFormInvalid}>
                                {#if isSubmitting}
                                    <Icon name="loader" size={16} spinning={true} />
                                    <span>{$_('task_detail.processing_button')}</span>
                                {:else}
                                    {$_('task_detail.complete_button')}
                                {/if}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- MODIFIED: Columna Derecha: Historial y Contexto -->
                    <div class="action-form">
                        <section class="info-section">
                            <h3><Icon name="file-text" size={16}/> {$_('task_detail.request_description_title')}</h3>
                            <p class="description-text">
                                {processInstance.description || $_('process_detail.no_description')}
                            </p>
                        </section>  

                        <section class="info-section comments-history-section">
                            <h3><Icon name="message-square" size={16}/> {$_('task_detail.comments_history_title')}</h3>
                            <div class="comments-list">
                                {#if formCommentsData.length > 0}
                                    {#each formCommentsData as comment}
                                        <div class="comment-item">
                                            <div class="comment-item-icon">
                                                <Icon name="message-circle" size={24} />
                                            </div>
                                            <div class="comment-item-content">
                                                <div class="comment-item-header">
                                                    <span class="task-name-comment">{comment.taskName}</span>
                                                    <strong class="user-name">{comment.user}</strong>
                                                </div>
                                                <p class="comment-text">{comment.text}</p>
                                                <span class="comment-date">{comment.date}</span>
                                            </div>
                                        </div>
                                    {/each}
                                {:else}
                                    <div class="no-data-placeholder">
                                        <Icon name="info" size={20} />
                                        <span>{$_('process_detail.no_comments')}</span>
                                    </div>
                                {/if}
                            </div>
                        </section>
                    </div>
                </div>
            {:else if activeTab === 'details'}
                <div class="process-details-content">
                    <div class="left-column">
                        <section class="info-section">
                            <h3><Icon name="info" size={16}/> {$_('process_detail.general_info_title')}</h3>
                            <ul class="data-list">
                                {#each generalInfo as item}
                                <li>
                                    <Icon name={item.icon} size={16} class="data-icon"/>
                                    <div>
                                    <span class="label">{item.label}</span>
                                    <span class="value">{item.value}</span>
                                    </div>
                                </li>
                                {/each}
                            </ul>
                        </section>
                        <section class="info-section">
                            <div class="timeline-header">
                                <h3><Icon name="git-commit" size={18}/> {$_('process_detail.traceability_title')}</h3>
                                {#if timeline.length > 0}
                                <span class="progress-indicator">{$_('process_detail.step_of', { values: { current: currentStepNumber, total: totalSteps } })}</span>
                                {/if}
                            </div>
                            <div class="timeline">
                                {#each timeline as step, i (step.taskName + i)}
                                <div class="timeline-item status-{step.status.toLowerCase()}">
                                    <div class="timeline-connector">
                                    <div class="timeline-icon">
                                        <Icon name={getStatusIcon(step.status).name} size={16} color={getStatusIcon(step.status).color} />
                                    </div>
                                    {#if i < timeline.length - 1}
                                        <div class="timeline-line"></div>
                                    {/if}
                                    </div>
                                    <div class="timeline-content">
                                    <p class="task-name">{step.taskName}</p>
                                    {#if step.status === 'COMPLETED'}
                                        <span class="user-info">{@html $_('process_detail.completed_by_on', { values: { user: step.user, date: step.date } })}</span>
                                    {/if}
                                    </div>
                                </div>
                                {/each}
                            </div>
                        </section>
                    </div>
                    <div class="right-column-details">
                        <div class="tab-content-details">
                            <section class="info-section">
                                <h3><Icon name="file-text" size={16}/> {$_('process_detail.request_details_tab')}</h3>
                                <div class="form-placeholder-details">
                                    {#if processInstance.businessDataFields && processInstance.businessDataFields.length > 0}
                                        {#each processInstance.businessDataFields as field}
                                            <div class="form-field">
                                                <label>{field.label}</label>
                                                <div class="value-box">
                                                {field.value}
                                                </div>
                                            </div>
                                        {/each}
                                    {:else}
                                        <p class="no-data-placeholder">{$_('process_detail.no_business_data')}</p>
                                    {/if}
                                </div>
                            </section>
                            <section class="info-section">
                                <h3><Icon name="message-square" size={16}/> {$_('process_detail.comments_tab')}</h3>
                                 <div class="comments-section">
                                    {#if commentsData.length > 0}
                                        {#each commentsData as comment}
                                            <div class="comment-bubble">
                                                <div class="comment-avatar">{comment.avatar}</div>
                                                <div class="comment-content">
                                                    <div class="comment-header">
                                                    <strong>{comment.user}</strong>
                                                    <span>{comment.date}</span>
                                                    </div>
                                                    <p>{comment.text}</p>
                                                </div>
                                            </div>
                                        {/each}
                                    {:else}
                                        <p class="no-data-placeholder">{$_('process_detail.no_comments')}</p>
                                    {/if}
                                </div>
                            </section>
                             <section class="info-section">
                                <h3><Icon name="paperclip" size={16}/> {$_('process_detail.documents_tab')}</h3>
                                 <div class="documents-section">
                                    {#if documentsData.length > 0}
                                        {#each documentsData as docGroup}
                                        {/each}
                                    {:else}
                                        <p class="no-data-placeholder">{$_('task_detail.no_documents')}</p>
                                    {/if}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
  </aside>
{/if}

<style>
/* Estilos existentes */
.panel-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1050;
}
.state-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 1rem; color: var(--text-secondary); text-align: center;
}
.state-placeholder.error { color: #c53030; }
.detail-panel.task-panel {
  width: 85vw; max-width: 1400px;
  background-color: var(--bg-primary);
  z-index: 1051;
  position: fixed; top: 0; right: 0; height: 100vh;
  box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color);
  flex-shrink: 0; background-color: var(--bg-secondary);
}
.header-subtitle {
  font-size: 0.9rem; color: var(--accent-color); font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.panel-header h2 { margin: 0.25rem 0; color: var(--text-primary); font-size: 1.75rem; }
.panel-header p { margin: 0; color: var(--text-secondary); }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }

.tab-header-tasks { 
    display: flex; border-bottom: 1px solid var(--border-color); 
    padding: 0 2rem; flex-shrink: 0; background-color: var(--bg-secondary);
}
.tab-header-tasks button {
  display: flex; align-items: center; gap: 0.5rem; background: none; border: none;
  padding: 1rem; font-size: 1rem; font-weight: 500; cursor: pointer;
  color: var(--text-secondary); position: relative;
  border-bottom: 3px solid transparent;
}
.tab-header-tasks button.active { color: var(--accent-color); border-color: var(--accent-color); }
.tab-header-tasks button:hover { color: var(--text-primary); }

.panel-content-full { flex-grow: 1; overflow-y: auto; padding: 2rem; }

.form-content {
    display: grid;
    grid-template-columns: 1fr 420px; /* Adjusted column width */
    gap: 2rem;
    height: 100%;
}
.dynamic-form {
    background-color: var(--bg-primary);
    overflow-y: auto;
    border-right: 1px solid var(--border-color);
    padding-right: 2rem;
}
.action-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-height: 100%; /* Ensure it doesn't overflow the container */
    overflow: hidden; /* Hide direct overflow */
}
.action-form h3, .dynamic-form h3, .action-section h3 {
  display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1.5rem 0;
  font-size: 1.25rem; color: var(--text-primary); font-weight: 600;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
.form-field { margin-bottom: 1.5rem; }
.form-field label { display: block; font-weight: 500; color: var(--text-primary); margin-bottom: 0.5rem; }
.form-field select, .form-field textarea, .form-field input {
  width: 100%; padding: 0.75rem; border: 1px solid var(--border-color);
  background-color: var(--bg-secondary); color: var(--text-primary);
  border-radius: 8px; font-size: 1rem; box-sizing: border-box;
}
.form-field input:disabled, .form-field textarea:disabled, .value-box {
    background-color: var(--bg-hover);
    color: var(--text-secondary);
    cursor: not-allowed;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    white-space: pre-wrap; 
    word-wrap: break-word;
}
.action-section {
    padding-top: 2rem;
    padding-right: 2rem;
    border-right: 1px solid var(--border-color);
    padding-bottom: 1.5rem;
}
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: auto; padding-top: 1rem; }
button { cursor: pointer; font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid transparent; }
.cancel-btn { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
.submit-btn { background-color: var(--accent-color); color: white; display: flex; align-items: center; gap: 0.5rem; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.process-details-content { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; height: 100%; }
.left-column { display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
.right-column-details { display: flex; flex-direction: column; min-width: 0; overflow-y: auto; }
.tab-content-details { display: flex; flex-direction: column; gap: 2rem; }
.info-section { background-color: var(--bg-secondary); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border-color); }
.info-section h3 {
  display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem 0;
  font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase;
  letter-spacing: 0.05em; font-weight: 600;
}
.form-placeholder-details { display: flex; flex-direction: column; gap: 1.5rem; }

.data-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.data-list li { display: flex; align-items: flex-start; gap: 0.75rem; }
.data-icon { color: var(--accent-color); margin-top: 3px; }
.data-list .label { display: block; font-size: 0.85rem; color: var(--text-secondary); }
.data-list .value { font-weight: 500; color: var(--text-primary); }
.timeline-header { display: flex; justify-content: space-between; align-items: center; }
.timeline-header h3 { margin: 0; }
.progress-indicator { font-size: 0.85rem; font-weight: 500; background-color: var(--bg-hover); color: var(--text-secondary); padding: 0.25rem 0.75rem; border-radius: 99px; }
.timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; position: relative; }
.timeline-connector { display: flex; flex-direction: column; align-items: center; margin-right: 1rem; }
.timeline-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid var(--border-color); background-color: var(--bg-secondary); z-index: 1; }
.timeline-line { flex-grow: 1; width: 2px; background-color: var(--border-color); }
.status-in_progress .timeline-icon { border-color: var(--accent-color); }
.status-completed .timeline-icon { border-color: var(--success-color); background-color: var(--success-color); color: white !important; }
.timeline-content { padding-bottom: 2rem; }
.task-name { font-weight: 600; margin: 0.5rem 0 0.25rem; }
.user-info { font-size: 0.85rem; color: var(--text-secondary); }
.status-in_progress .task-name { color: var(--accent-color); }
.comments-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.no-data-placeholder {
    font-style: italic;
    color: var(--text-secondary);
    text-align: center;
    padding: 2rem;
    background-color: var(--bg-primary);
    border-radius: 8px;
}
.comment-bubble { display: flex; gap: 1rem; }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; background-color: var(--accent-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.comment-content { background-color: var(--bg-primary); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); width: 100%; }
.comment-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
.comment-header span { font-size: 0.8rem; color: var(--text-secondary); }
.comment-content p { margin: 0; }
.documents-section h4 { color: var(--text-primary); margin: 0 0 1rem 0; }
.file-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.file-list li {
  display: flex; align-items: center; gap: 1rem; padding: 0.75rem;
  border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-primary);
}
.file-icon { color: var(--text-secondary); }
.file-info { flex-grow: 1; }
.file-name { color: var(--accent-color); text-decoration: none; font-weight: 500; }
.file-name:hover { text-decoration: underline; }
.file-meta { display: block; font-size: 0.8rem; color: var(--text-secondary); }
.download-btn { color: var(--text-secondary); }
.download-btn:hover { color: var(--accent-color); }
.required-star { color: #c53030; margin-left: 0.25rem; }
/* --- NEW STYLES --- */
/* Add these at the end of your <style> block */

    .description-text {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-wrap: break-word;
}

.comments-history-section {
    flex-grow: 1; /* Allows this section to fill available space */
    min-height: 0; /* Prevents flexbox overflow issues */
    display: flex;
    flex-direction: column;
}

.comments-list {
    overflow-y: auto; /* Makes the list scrollable */
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-right: 0.5rem; /* Space for scrollbar */
}

.comment-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.comment-item-icon {
    color: var(--accent-color);
    flex-shrink: 0;
    padding-top: 0.25rem;
}

.comment-item-content {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    width: 100%;
}

.comment-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.comment-item-header .task-name-comment {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.comment-item-header .user-name {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.comment-text {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
    color: var(--text-primary);
}

.comment-date {
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-align: right;
    display: block;
}

/* Enhancing the existing no-data-placeholder for this specific context */
.comments-list .no-data-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    text-align: center;
    padding: 2rem 1rem;
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    color: var(--text-secondary);
    height: 100%;
}
</style>
