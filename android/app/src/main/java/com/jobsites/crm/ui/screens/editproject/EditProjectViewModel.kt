package com.jobsites.crm.ui.screens.editproject

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import com.jobsites.crm.data.model.Address
import com.jobsites.crm.data.model.LookupOption
import com.jobsites.crm.data.model.User
import com.jobsites.crm.data.network.NominatimService
import com.jobsites.crm.data.repository.CrmRepository
import com.jobsites.crm.ui.screens.shared.FormValidationError
import com.jobsites.crm.ui.screens.shared.ProjectFormState
import com.jobsites.crm.ui.screens.shared.validateProjectForm
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class EditProjectUiState(
    val form: ProjectFormState = ProjectFormState(),
    val projectName: String = "",
    val users: List<User> = emptyList(),
    val primaryStages: List<LookupOption> = emptyList(),
    val primaryProjectTypes: List<LookupOption> = emptyList(),
    val ownershipTypes: List<LookupOption> = emptyList(),
    val error: String? = null,
    val saved: Boolean = false
)

@HiltViewModel
class EditProjectViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: CrmRepository,
    val nominatimService: NominatimService
) : ViewModel() {

    private val projectId: Int = savedStateHandle["projectId"] ?: 0

    private val _uiState = MutableStateFlow(EditProjectUiState())
    val uiState: StateFlow<EditProjectUiState> = _uiState.asStateFlow()

    init {
        val project = repository.projects.value.find { it.id == projectId }
        val lookups = repository.lookups.value

        val form = if (project != null) {
            ProjectFormState(
                name = project.name,
                description = project.description,
                statusId = project.statusId,
                assigneeIds = project.assigneeIds.map { it.toString() },
                street = project.address.street,
                city = project.address.city,
                state = project.address.state,
                zipCode = project.address.zipCode,
                country = project.address.country,
                valuation = project.valuation?.toString() ?: "",
                ownershipTypeId = project.ownershipTypeId ?: "",
                primaryStageId = project.primaryStageId ?: "",
                primaryProjectTypeId = project.primaryProjectTypeId ?: "",
                bidDate = project.bidDate,
                targetStartDate = project.targetStartDate,
                targetCompletionDate = project.targetCompletionDate,
                useCoordinates = project.address.latitude != 0.0 || project.address.longitude != 0.0,
                latitude = if (project.address.latitude != 0.0) project.address.latitude.toString() else "",
                longitude = if (project.address.longitude != 0.0) project.address.longitude.toString() else ""
            )
        } else ProjectFormState()

        _uiState.value = EditProjectUiState(
            form = form,
            projectName = project?.name ?: "Project",
            users = repository.users.value,
            primaryStages = lookups.primaryStages,
            primaryProjectTypes = lookups.primaryProjectTypes,
            ownershipTypes = lookups.ownershipTypes
        )
    }

    fun onFormChange(form: ProjectFormState) {
        _uiState.value = _uiState.value.copy(form = form, error = null)
    }

    fun save(): Boolean {
        val form = _uiState.value.form
        // Name is not editable in edit mode, so skip name validation
        val validationError: FormValidationError? = validateProjectForm(form, requireName = false)
        if (validationError != null) {
            _uiState.value = _uiState.value.copy(error = validationError.message)
            return false
        }

        val valuation = form.valuation.replace(",", "").toDoubleOrNull()?.toLong()

        repository.updateProject(projectId) { existing ->
            existing.copy(
                description = form.description.trim(),
                statusId = form.statusId,
                assigneeIds = form.assigneeIds.mapNotNull { it.toIntOrNull() },
                address = Address(
                    street = form.street.trim(),
                    city = form.city.trim(),
                    state = form.state.trim(),
                    zipCode = form.zipCode.trim(),
                    country = form.country.trim(),
                    latitude = form.latitude.toDoubleOrNull() ?: 0.0,
                    longitude = form.longitude.toDoubleOrNull() ?: 0.0
                ),
                valuation = valuation,
                ownershipTypeId = form.ownershipTypeId.takeIf { it.isNotBlank() },
                primaryStageId = form.primaryStageId.takeIf { it.isNotBlank() },
                primaryProjectTypeId = form.primaryProjectTypeId.takeIf { it.isNotBlank() },
                bidDate = form.bidDate,
                targetStartDate = form.targetStartDate,
                targetCompletionDate = form.targetCompletionDate
            )
        }

        _uiState.value = _uiState.value.copy(saved = true)
        return true
    }
}
