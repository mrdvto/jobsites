package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import com.jobsites.crm.ui.components.FilteredEmptyState
import com.jobsites.crm.ui.components.SectionSearchBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jobsites.crm.data.model.CustomerEquipment
import com.jobsites.crm.ui.theme.EquipmentOwned
import com.jobsites.crm.ui.theme.EquipmentRented

@Composable
fun EquipmentSection(
    equipment: List<CustomerEquipment>,
    getCompanyName: (String) -> String = { it },
    onDelete: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    val filtered = if (searchQuery.isBlank()) equipment else {
        val q = searchQuery.lowercase()
        equipment.filter { item ->
            item.make.lowercase().contains(q) ||
            item.model.lowercase().contains(q) ||
            item.equipmentType.lowercase().contains(q) ||
            (item.serialNumber?.lowercase()?.contains(q) == true)
        }
    }

    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (equipment.size > 3) {
            SectionSearchBar(query = searchQuery, onQueryChange = { searchQuery = it }, placeholder = "Search equipment…")
        }

        if (filtered.isEmpty() && searchQuery.isNotBlank()) {
            FilteredEmptyState("No equipment matches \"$searchQuery\"")
        }

        filtered.forEach { item ->
            EquipmentCard(item = item, getCompanyName = getCompanyName, onDelete = { onDelete(item.id) })
        }
    }
}

@Composable
private fun EquipmentCard(
    item: CustomerEquipment,
    getCompanyName: (String) -> String = { it },
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                // Make + Model (primary line)
                Text(
                    text = "${item.make} ${item.model}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                // Company
                if (item.companyId.isNotBlank()) {
                    Text(
                        text = getCompanyName(item.companyId),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                // Year + Type
                Row {
                    item.year?.let {
                        Text(
                            text = it.toString(),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(Modifier.width(8.dp))
                    }
                    Text(
                        text = item.equipmentType,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                // Serial + SMU + Ownership
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    item.serialNumber?.let {
                        if (it.isNotBlank()) {
                            Text(
                                text = "S/N: $it",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 12.sp
                            )
                        }
                    }
                    item.smu?.let {
                        Text(
                            text = "SMU: $it",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp
                        )
                    }
                    val ownershipColor = when (item.ownershipStatus.lowercase()) {
                        "owned" -> EquipmentOwned
                        "rented" -> EquipmentRented
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    }
                    Text(
                        text = item.ownershipStatus.replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Medium,
                        color = ownershipColor,
                        fontSize = 12.sp
                    )
                }
            }
            IconButton(onClick = onDelete) {
                Icon(
                    Icons.Outlined.Delete, "Remove",
                    tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f)
                )
            }
        }
    }
}
